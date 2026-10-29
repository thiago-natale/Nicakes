/**
 * /encomendas — comportamento do formulário (DOM).
 * Lê as escolhas, atualiza o resumo e o valor estimado a cada mudança, aplica o
 * limite de recheios, abre os campos complementares, valida e, no envio, abre o
 * WhatsApp com a mensagem pronta. As escolhas ficam num rascunho em
 * sessionStorage (nada é enviado a servidor algum).
 * Regras e textos: orderForm.ts (puro, testado).
 */
import gsap from 'gsap';
import { birthdayCake, formatKg, formatPrice } from '../../../data/menu';
import { whatsappLink } from '../../../data/site';
import { priceIn } from '../../../scripts/motion/counters';
import { EASE } from '../../../scripts/motion/eases';
import {
  answerField,
  buildMessage,
  calcTotal,
  decorationOf,
  earliestPickup,
  extraAvailable,
  emptySelection,
  formatPickupDate,
  pricePerKgOf,
  fromISODate,
  isOpenDay,
  PERIODS,
  priceLines,
  toISODate,
  validate,
  type OrderErrors,
  type OrderSelection,
} from './orderForm';

const DRAFT_KEY = 'nicakes:order-draft';
const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const form = document.querySelector<HTMLFormElement>('[data-order-form]');
if (form) setup(form);

function setup(form: HTMLFormElement): void {
  const $ = <T extends Element = HTMLElement>(s: string): T | null => form.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string): T[] => Array.from(form.querySelectorAll<T>(s));

  const totalEl = $('[data-total]');
  const totalSr = $('[data-total-sr]');
  const barTotal = $('[data-bar-total]');
  const bar = $('[data-order-bar]');
  const linesEl = $('[data-summary-lines]');
  const countEl = $('[data-filling-count]');
  const maxNote = $('[data-filling-max]');
  const errorsBox = $('[data-errors]');
  const submit = $<HTMLButtonElement>('[data-order-submit]');
  const submitLabel = submit?.querySelector('.btn__label') ?? null;
  const submitText = submitLabel?.textContent ?? '';
  const dateInput = $<HTMLInputElement>('input[name="date"]');
  const dateHint = $('[data-hint-for="date"]');
  const notes = $<HTMLTextAreaElement>('textarea[name="notes"]');
  const notesCounter = $('[data-counter-for="order-notes"]');

  let attempted = false; // depois da 1ª tentativa de envio, valida a cada mudança
  let lastTotal = 0;
  let lastLines = new Set<string>();
  let srTimer = 0;
  let booting = true; // estado inicial (rascunho) aplicado sem animação

  /* ---------- Data mínima (calculada no navegador, não no build) ---------- */
  const today = (): Date => new Date();
  const minDate = earliestPickup(today());
  if (dateInput) {
    dateInput.min = toISODate(minDate);
    const max = new Date(minDate);
    max.setDate(max.getDate() + 180);
    dateInput.max = toISODate(max);
  }
  if (dateHint) {
    dateHint.textContent = `A partir de ${formatPickupDate(minDate)}. Segunda-feira a loja fica fechada.`;
  }

  /* ---------- Leitura ---------- */
  function read(): OrderSelection {
    const fd = new FormData(form);
    const sel = emptySelection();
    sel.decoration = String(fd.get('decoration') ?? '');
    const kg = Number(fd.get('size'));
    sel.kg = kg > 0 ? kg : null;
    sel.dough = String(fd.get('dough') ?? '');
    sel.fillings = fd.getAll('filling').map(String);
    sel.extras = fd.getAll('extra').map(String);
    for (const name of sel.fillings) sel.fillingAnswers[name] = String(fd.get(answerField('filling', name)) ?? '');
    for (const name of sel.extras) sel.extraAnswers[name] = String(fd.get(answerField('extra', name)) ?? '');
    sel.date = String(fd.get('date') ?? '');
    const period = String(fd.get('period') ?? '');
    sel.period = period === 'manha' || period === 'tarde' ? period : '';
    sel.name = String(fd.get('name') ?? '');
    sel.notes = String(fd.get('notes') ?? '');
    return sel;
  }

  /* ---------- Campos complementares (abrem por altura) ---------- */
  function toggleAsk(el: HTMLElement, show: boolean): void {
    if (show === !el.hidden) return;
    const input = el.querySelector<HTMLInputElement>('input, textarea');
    if (booting || reduceMotion()) {
      el.hidden = !show;
      return;
    }
    gsap.killTweensOf(el);
    if (show) {
      el.hidden = false;
      gsap.from(el, { height: 0, autoAlpha: 0, duration: 0.4, ease: EASE.soft, clearProps: 'height,opacity,visibility' });
    } else {
      gsap.to(el, {
        height: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          el.hidden = true;
          gsap.set(el, { clearProps: 'height,opacity,visibility' });
        },
      });
    }
    if (!show && input) clearError(input.name);
  }

  /* ---------- Decoração → preço do quilo nos tamanhos ---------- */
  const sizeRate = $('[data-size-rate]');
  const extraNote = $('[data-extra-note]');
  let lastRate = pricePerKgOf(emptySelection());

  /** Troca um valor exibido: o antigo sobe e sai, o novo sobe da máscara. */
  function swapText(el: HTMLElement, text: string, delay = 0): void {
    if (el.textContent === text) return;
    if (booting || reduceMotion()) {
      el.textContent = text;
      return;
    }
    gsap.killTweensOf(el);
    gsap.to(el, {
      yPercent: -60,
      autoAlpha: 0,
      duration: 0.18,
      delay,
      ease: 'power2.in',
      onComplete: () => {
        el.textContent = text;
        priceIn(el, { duration: 0.45 });
      },
    });
  }

  function applyDecoration(sel: OrderSelection): void {
    const rate = pricePerKgOf(sel);
    const deco = decorationOf(sel);
    if (sizeRate) sizeRate.textContent = `${formatPrice(rate)} o quilo com ${deco.name.toLowerCase()}`;
    if (rate !== lastRate || booting) {
      $$<HTMLInputElement>('input[name="size"]').forEach((input, i) => {
        const price = input.closest('.choice')?.querySelector<HTMLElement>('.choice__price');
        if (price) swapText(price, formatPrice(Number(input.value) * rate), i * 0.03);
      });
      lastRate = rate;
    }
    // Adicionais indisponíveis com a decoração (ex.: cores com ganache)
    const blocked: string[] = [];
    $$<HTMLInputElement>('input[name="extra"]').forEach((input) => {
      const ok = extraAvailable(input.value, deco.name);
      if (!ok) {
        if (input.checked) input.checked = false;
        blocked.push(input.value);
      }
      input.disabled = !ok;
    });
    if (extraNote) {
      extraNote.hidden = !blocked.length;
      extraNote.textContent = blocked.length
        ? `Com ${deco.name.toLowerCase()}, ${blocked.map((b) => `“${b}”`).join(' e ')} não ${blocked.length > 1 ? 'estão disponíveis' : 'está disponível'}.`
        : '';
    }
  }

  /* ---------- Valor ---------- */
  function setTotal(value: number): void {
    const text = formatPrice(value);
    if (value === lastTotal) return;
    lastTotal = value;
    const targets = [totalEl, barTotal].filter((el): el is HTMLElement => !!el);
    if (reduceMotion()) {
      targets.forEach((el) => (el.textContent = text));
    } else {
      targets.forEach((el) => {
        gsap.killTweensOf(el);
        gsap.to(el, {
          yPercent: -60,
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power2.in',
          onComplete: () => {
            el.textContent = text;
            priceIn(el, { duration: 0.45 });
          },
        });
      });
      // Barra do celular "quica" de leve quando o valor muda
      if (bar && !bar.classList.contains('is-hidden')) {
        gsap.fromTo(bar, { y: 0 }, { y: -5, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out', clearProps: 'transform' });
      }
    }
    // Leitor de tela: anuncia o total só depois que a pessoa para de mexer
    window.clearTimeout(srTimer);
    srTimer = window.setTimeout(() => {
      if (totalSr) totalSr.textContent = `Total estimado: ${text}`;
    }, 900);
  }

  function renderLines(sel: OrderSelection): void {
    if (!linesEl) return;
    const lines = priceLines(sel);
    const next = new Set(lines.map((l) => l.label));
    linesEl.replaceChildren(
      ...lines.map((l) => {
        const li = document.createElement('li');
        li.className = 'order-summary__line';
        if (!lastLines.has(l.label)) li.classList.add('is-new');
        const label = document.createElement('span');
        label.textContent = l.label;
        const leader = document.createElement('span');
        leader.className = 'order-summary__line-leader';
        leader.setAttribute('aria-hidden', 'true');
        const value = document.createElement('span');
        value.className = 'order-summary__line-value';
        value.textContent = formatPrice(l.value);
        li.append(label, leader, value);
        return li;
      }),
    );
    lastLines = next;
  }

  function setDetail(key: string, text: string, empty: boolean): void {
    const dd = $(`[data-summary="${key}"]`);
    if (!dd) return;
    dd.textContent = text;
    dd.classList.toggle('is-empty', empty);
  }

  function renderSummary(sel: OrderSelection): void {
    setDetail('decoration', `${decorationOf(sel).name} · ${formatPrice(pricePerKgOf(sel))}/kg`, false);
    const size = birthdayCake.sizes.find((s) => s.kg === sel.kg);
    setDetail('size', size ? `${formatKg(size.kg)} · ${size.serves}` : 'A escolher', !size);
    setDetail('dough', sel.dough || 'A escolher', !sel.dough);
    const fillings = sel.fillings.map((n) => {
      const a = sel.fillingAnswers[n]?.trim();
      return a ? `${n} (${a})` : n;
    });
    setDetail('fillings', fillings.join(' e ') || 'A escolher', !fillings.length);
    setDetail('extras', sel.extras.join(' · ') || 'Nenhum', !sel.extras.length);
    const date = fromISODate(sel.date);
    const pickup = date ? `${formatPickupDate(date)}${sel.period ? `, ${PERIODS[sel.period]}` : ''}` : 'A escolher';
    setDetail('pickup', pickup, !date);
  }

  /* ---------- Limite de recheios ---------- */
  function applyFillingLimit(sel: OrderSelection): void {
    const max = birthdayCake.rules.maxFillings;
    const full = sel.fillings.length >= max;
    $$<HTMLInputElement>('input[name="filling"]').forEach((input) => {
      input.disabled = full && !input.checked;
    });
    if (maxNote) maxNote.hidden = !full;
    if (countEl) {
      const text = `${sel.fillings.length} de ${max} escolhido${sel.fillings.length === 1 ? '' : 's'}`;
      if (countEl.textContent !== text) {
        countEl.textContent = text;
        countEl.classList.remove('is-bump');
        void countEl.offsetWidth; // reinicia a animação
        countEl.classList.add('is-bump');
      }
    }
  }

  function applyAsks(sel: OrderSelection): void {
    birthdayCake.fillings.forEach((f) => {
      if (!f.ask) return;
      const el = $(`[data-ask="${answerField('filling', f.name)}"]`);
      if (el) toggleAsk(el, sel.fillings.includes(f.name));
    });
    birthdayCake.extras.forEach((e) => {
      if (!e.ask) return;
      const el = $(`[data-ask="${answerField('extra', e.name)}"]`);
      if (el) toggleAsk(el, sel.extras.includes(e.name));
    });
  }

  /* ---------- Erros ---------- */
  const groupKeys = new Set(['decoration', 'size', 'dough', 'filling', 'period']);

  function controlsOf(key: string): HTMLElement[] {
    return $$<HTMLInputElement>(`[name="${key}"]`);
  }

  function clearError(key: string): void {
    const slot = $(`[data-error-for="${key}"]`);
    if (slot) {
      slot.hidden = true;
      slot.textContent = '';
    }
    controlsOf(key).forEach((c) => c.removeAttribute('aria-invalid'));
    if (groupKeys.has(key)) slot?.closest('fieldset')?.classList.remove('is-invalid');
  }

  function showError(key: string, message: string): void {
    const slot = $(`[data-error-for="${key}"]`);
    if (slot) {
      slot.textContent = message;
      slot.hidden = false;
    }
    controlsOf(key).forEach((c) => c.setAttribute('aria-invalid', 'true'));
    if (groupKeys.has(key)) slot?.closest('fieldset')?.classList.add('is-invalid');
  }

  /** Mostra os erros na ordem da página e devolve o primeiro controle inválido. */
  function renderErrors(errors: OrderErrors): HTMLElement | null {
    const known = new Set<string>();
    $$('[data-error-for]').forEach((slot) => known.add(slot.dataset.errorFor ?? ''));
    known.forEach((key) => (errors[key] ? showError(key, errors[key] as string) : clearError(key)));

    const firstControls = Object.keys(errors)
      .map((key) => ({ key, el: controlsOf(key).find((c) => !(c as HTMLInputElement).disabled) ?? null }))
      .filter((x): x is { key: string; el: HTMLElement } => !!x.el)
      .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    if (errorsBox) {
      if (firstControls.length) {
        const n = firstControls.length;
        const title = document.createElement('p');
        title.textContent = n === 1 ? 'Falta 1 item para enviar o pedido:' : `Faltam ${n} itens para enviar o pedido:`;
        const list = document.createElement('ul');
        firstControls.forEach(({ key, el }) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          const target = groupKeys.has(key) ? el.closest('fieldset') : el;
          a.href = `#${target?.id || el.id}`;
          a.textContent = errors[key] ?? '';
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            focusControl(el);
          });
          li.append(a);
          list.append(li);
        });
        errorsBox.replaceChildren(title, list);
        errorsBox.hidden = false;
      } else {
        errorsBox.hidden = true;
        errorsBox.replaceChildren();
      }
    }
    return firstControls[0]?.el ?? null;
  }

  function focusControl(el: HTMLElement): void {
    const target = el.closest('fieldset.order-step') ?? el;
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }

  /* ---------- Rascunho ---------- */
  function saveDraft(): void {
    try {
      const entries = Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v)]);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(entries));
    } catch {
      /* armazenamento indisponível: segue sem rascunho */
    }
  }

  function restoreDraft(): void {
    let entries: Array<[string, string]> = [];
    try {
      entries = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '[]');
    } catch {
      return;
    }
    if (!Array.isArray(entries)) return;
    for (const [name, value] of entries) {
      const fields = $$<HTMLInputElement | HTMLTextAreaElement>(`[name="${CSS.escape(name)}"]`);
      for (const field of fields) {
        if (field instanceof HTMLInputElement && (field.type === 'radio' || field.type === 'checkbox')) {
          if (field.value === value) field.checked = true;
        } else {
          field.value = value;
        }
      }
    }
  }

  /* ---------- Atualização ---------- */
  function update(opts: { save?: boolean } = {}): void {
    applyDecoration(read()); // pode desmarcar um adicional indisponível
    const sel = read();
    applyFillingLimit(sel);
    applyAsks(sel);
    renderSummary(sel);
    renderLines(sel);
    setTotal(calcTotal(sel));
    if (notes && notesCounter) notesCounter.textContent = `${notes.value.length}/${notes.maxLength}`;
    if (attempted) renderErrors(validate(sel, today()));
    if (opts.save !== false) saveDraft();
  }

  // Data: avisa já ao escolher um dia fechado ou antes do prazo
  dateInput?.addEventListener('change', () => {
    const d = fromISODate(dateInput.value);
    if (!d) return;
    if (d < minDate) showError('date', `A data mais próxima para retirada é ${formatPickupDate(minDate)}.`);
    else if (!isOpenDay(d)) showError('date', 'Nesse dia a loja está fechada. Escolha outra data.');
    else if (!attempted) clearError('date');
  });

  form.addEventListener('input', () => update());
  form.addEventListener('change', () => update());

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    attempted = true;
    const sel = read();
    const first = renderErrors(validate(sel, today()));
    if (first) {
      focusControl(first);
      return;
    }
    saveDraft();
    if (submit) {
      submit.setAttribute('aria-busy', 'true');
      if (submitLabel) submitLabel.textContent = 'Abrindo o WhatsApp…';
    }
    window.location.href = whatsappLink(buildMessage(sel));
  });

  // Ao voltar do WhatsApp (bfcache), o botão volta ao normal
  window.addEventListener('pageshow', () => {
    submit?.removeAttribute('aria-busy');
    if (submitLabel) submitLabel.textContent = submitText;
  });

  $('[data-order-reset]')?.addEventListener('click', () => {
    form.reset();
    attempted = false;
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nada */
    }
    renderErrors({});
    update({ save: false });
    $<HTMLElement>('#etapa-decoracao')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- Barra do celular: some quando o resumo está na tela ---------- */
  const summary = document.getElementById('resumo');
  if (bar && summary && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => bar.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.15 }).observe(summary);
  }

  restoreDraft();
  // Estado inicial sem animar o total
  const initial = read();
  lastTotal = calcTotal(initial);
  [totalEl, barTotal].forEach((el) => el && (el.textContent = formatPrice(lastTotal)));
  lastLines = new Set(priceLines(initial).map((l) => l.label));
  update({ save: false });
  booting = false;
}
