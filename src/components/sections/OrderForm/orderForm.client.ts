/**
 * /encomendas — comportamento do formulário (DOM).
 * Abre/fecha os blocos de cada produto (bolo, docinhos), lê as escolhas,
 * atualiza o resumo agrupado, os subtotais e o valor estimado a cada mudança,
 * aplica o limite de recheios e as quantidades dos docinhos, abre os campos
 * complementares, valida e, no envio, abre o WhatsApp com a mensagem pronta.
 * As escolhas ficam num rascunho em sessionStorage (nada é enviado a servidor).
 * Regras e textos: orderForm.ts (puro, testado).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { birthdayCake, formatPrice, partySweets } from '../../../data/menu';
import { whatsappLink } from '../../../data/site';
import { priceIn } from '../../../scripts/motion/counters';
import { EASE } from '../../../scripts/motion/eases';
import {
  answerField,
  buildMessage,
  CUSTOM_BRIEF,
  CUSTOM_ON,
  CUSTOM_QTY,
  decorationOf,
  DRAFT_KEY,
  DRAFT_VERSION,
  earliestPickup,
  extraAvailable,
  emptySelection,
  formatPickupDate,
  fromISODate,
  isOpenDay,
  leadDaysOf,
  orderShortLabel,
  orderSummary,
  PERIODS,
  pricePerKgOf,
  snapQty,
  SWEET_EXTRA,
  sweetCatKey,
  sweetExtraAvailable,
  sweetField,
  sweetPrice,
  sweetQty,
  sweetsCount,
  toISODate,
  validate,
  type OrderErrors,
  type OrderSelection,
  type OrderSummary,
  type ProductId,
} from './orderForm';

const PRODUCTS: ProductId[] = ['cake', 'sweets'];
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
  const groupsEl = $('[data-summary-groups]');
  const emptyEl = $('[data-summary-empty]');
  const pendingEl = $('[data-summary-pending]');
  const barLabel = $('[data-bar-label]');
  const countEl = $('[data-filling-count]');
  const maxNote = $('[data-filling-max]');
  const errorsBox = $('[data-errors]');
  const submit = $<HTMLButtonElement>('[data-order-submit]');
  const submitLabel = submit?.querySelector('.btn__label') ?? null;
  const submitText = submitLabel?.textContent ?? '';
  const dateInput = $<HTMLInputElement>('input[name="date"]');
  const dateHint = $('[data-hint-for="date"]');

  let attempted = false; // depois da 1ª tentativa de envio, valida a cada mudança
  let lastTotal = 0;
  let lastLines = new Set<string>();
  const lastSubtotals: Record<string, number> = {};
  let srTimer = 0;
  let booting = true; // estado inicial (rascunho) aplicado sem animação

  /* ---------- Data mínima (calculada no navegador, conforme os produtos) ---------- */
  const today = (): Date => new Date();
  let minDate = earliestPickup(today());
  let lastLead = -1;
  function applyMinDate(sel: OrderSelection): void {
    const lead = leadDaysOf(sel);
    if (lead === lastLead) return;
    lastLead = lead;
    minDate = earliestPickup(today(), lead);
    if (dateInput) {
      dateInput.min = toISODate(minDate);
      const max = new Date(minDate);
      max.setDate(max.getDate() + 180);
      dateInput.max = toISODate(max);
    }
    if (dateHint) {
      const who = sel.products.sweets ? `Com docinhos, ${lead} dias de antecedência: a` : 'A';
      dateHint.textContent = `${who} partir de ${formatPickupDate(minDate)}. Segunda-feira a loja fica fechada.`;
    }
  }

  /* ---------- Leitura ---------- */
  function read(): OrderSelection {
    const fd = new FormData(form);
    const sel = emptySelection();
    const products = fd.getAll('product').map(String);
    PRODUCTS.forEach((p) => (sel.products[p] = products.includes(p)));
    sel.decoration = String(fd.get('decoration') ?? '');
    const kg = Number(fd.get('size'));
    sel.kg = kg > 0 ? kg : null;
    sel.dough = String(fd.get('dough') ?? '');
    sel.fillings = fd.getAll('filling').map(String);
    sel.extras = fd.getAll('extra').map(String);
    for (const name of sel.fillings) sel.fillingAnswers[name] = String(fd.get(answerField('filling', name)) ?? '');
    for (const name of sel.extras) sel.extraAnswers[name] = String(fd.get(answerField('extra', name)) ?? '');
    for (const c of partySweets.categories) {
      const chosen: Record<string, number> = {};
      c.flavors.forEach((f, i) => {
        const n = Number(fd.get(sweetField(c.id, i)));
        if (n > 0) chosen[f] = n;
      });
      sel.sweets[c.id] = chosen;
    }
    sel.custom = {
      on: fd.get(CUSTOM_ON) === 'sim',
      qty: Number(fd.get(CUSTOM_QTY)) || 0,
      brief: String(fd.get(CUSTOM_BRIEF) ?? ''),
    };
    sel.sweetExtras = fd.getAll(SWEET_EXTRA).map(String);
    sel.date = String(fd.get('date') ?? '');
    const period = String(fd.get('period') ?? '');
    sel.period = period === 'manha' || period === 'tarde' ? period : '';
    sel.name = String(fd.get('name') ?? '');
    sel.notes = String(fd.get('notes') ?? '');
    sel.source = String(fd.get('source') ?? '');
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

  /* ---------- Resumo agrupado por produto ---------- */
  function lineEl(key: string, label: string, detail: string | undefined, value: number | null | undefined): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'order-summary__line';
    if (value === undefined) li.classList.add('order-summary__line--info');
    if (!lastLines.has(key)) li.classList.add('is-new');
    const text = document.createElement('span');
    text.textContent = label;
    li.append(text);
    if (value !== undefined) {
      const leader = document.createElement('span');
      leader.className = 'order-summary__line-leader';
      leader.setAttribute('aria-hidden', 'true');
      const v = document.createElement('span');
      v.className = 'order-summary__line-value';
      if (value === null) v.classList.add('is-pending');
      v.textContent = value === null ? 'a combinar' : formatPrice(value);
      li.append(leader, v);
    }
    if (detail) {
      const d = document.createElement('span');
      d.className = 'order-summary__line-detail';
      d.textContent = detail;
      li.append(d);
    }
    return li;
  }

  function renderGroups(summary: OrderSummary): void {
    if (!groupsEl) return;
    const next = new Set<string>();
    groupsEl.replaceChildren(
      ...summary.groups.map((g) => {
        const section = document.createElement('section');
        section.className = 'order-summary__group';
        section.setAttribute('aria-label', g.title);
        const head = document.createElement('div');
        head.className = 'order-summary__group-head';
        const title = document.createElement('h3');
        title.className = 'order-summary__group-title';
        title.textContent = g.title;
        const sub = document.createElement('span');
        sub.className = 'order-summary__group-subtotal';
        sub.textContent = formatPrice(g.subtotal);
        head.append(title, sub);
        section.append(head);
        if (g.lines.length) {
          const ul = document.createElement('ul');
          ul.className = 'order-summary__lines';
          g.lines.forEach((l) => {
            next.add(l.key);
            ul.append(lineEl(l.key, l.label, l.detail, l.value));
          });
          section.append(ul);
        } else {
          const p = document.createElement('p');
          p.className = 'order-summary__group-empty';
          p.textContent = g.id === 'sweets' ? 'Escolha os sabores e as quantidades.' : 'Escolha o tamanho do bolo.';
          section.append(p);
        }
        return section;
      }),
    );
    lastLines = next;
    if (emptyEl) emptyEl.hidden = summary.groups.length > 0;
    if (pendingEl) pendingEl.hidden = !summary.pending;
  }

  /** Subtotal ao vivo no cabeçalho de cada bloco. */
  function renderSubtotals(summary: OrderSummary): void {
    PRODUCTS.forEach((id) => {
      const el = $(`[data-block-subtotal="${id}"]`);
      const value = summary.groups.find((g) => g.id === id)?.subtotal ?? 0;
      if (!el || lastSubtotals[id] === value) return;
      lastSubtotals[id] = value;
      swapText(el, formatPrice(value));
    });
  }

  function renderPickup(sel: OrderSelection): void {
    const dd = $('[data-summary="pickup"]');
    if (!dd) return;
    const date = fromISODate(sel.date);
    dd.textContent = date ? `${formatPickupDate(date)}${sel.period ? `, ${PERIODS[sel.period]}` : ''}` : 'A escolher';
    dd.classList.toggle('is-empty', !date);
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
    const custom = $(`[data-ask="${CUSTOM_ON}"]`);
    if (custom) toggleAsk(custom, sel.custom.on);
  }

  /* ---------- Docinhos: contadores, sabores ativos e extras ---------- */
  const extraSweetNote = $('[data-sweet-extra-note]');

  function applySweets(sel: OrderSelection): void {
    const { minTotal } = partySweets.rules;
    for (const c of partySweets.categories) {
      const qty = sweetQty(sel, c.id);
      const cat = $(`[data-sweet-cat="${c.id}"]`);
      cat?.classList.toggle('has-items', qty > 0);
      if (qty > 0 && cat instanceof HTMLDetailsElement && booting) cat.open = true;
      const count = $(`[data-sweet-count="${c.id}"]`);
      if (count) {
        const text = qty
          ? `${qty} un. · ${formatPrice(sweetPrice(c.id, qty))}`
          : `${c.flavors.length} sabores`;
        if (count.textContent !== text) {
          count.textContent = text;
          count.classList.toggle('is-on', qty > 0);
          if (!booting && !reduceMotion()) {
            count.classList.remove('is-bump');
            void count.offsetWidth;
            count.classList.add('is-bump');
          }
        }
      }
    }
    // Total de docinhos (o mínimo vale para o pedido todo, somando os tipos)
    const totalEl = $('[data-sweets-total]');
    if (totalEl) {
      const total = sweetsCount(sel);
      totalEl.textContent = !total
        ? `Nenhum docinho escolhido ainda · mínimo de ${minTotal}`
        : total < minTotal
          ? `${total} docinhos no pedido · faltam ${minTotal - total} para o mínimo de ${minTotal}`
          : `${total} docinhos no pedido`;
      totalEl.classList.toggle('is-short', total > 0 && total < minTotal);
      totalEl.classList.toggle('is-ok', total >= minTotal);
    }
    // Sabor com quantidade: destaque na linha e no seletor; botão "−" inativo no zero
    $$<HTMLElement>('[data-qty]').forEach((qty) => {
      const input = qty.querySelector<HTMLInputElement>('input');
      const n = Number(input?.value) || 0;
      qty.classList.toggle('is-active', n > 0);
      qty.closest('[data-sweet-flavor]')?.classList.toggle('is-active', n > 0);
      qty.querySelector('[data-qty-step="-1"]')?.setAttribute('aria-disabled', String(n <= 0));
    });
    // Cereja em cima: só com mini brownie
    let blocked = false;
    $$<HTMLInputElement>(`input[name="${SWEET_EXTRA}"]`).forEach((input) => {
      const ok = sweetExtraAvailable(sel, input.value);
      if (!ok && input.checked) blocked = true;
      input.setAttribute('aria-disabled', String(!ok));
      input.closest('.choice')?.classList.toggle('is-unavailable', !ok);
    });
    if (extraSweetNote) extraSweetNote.hidden = !blocked;
  }

  /* ---------- Produtos: abre/fecha os blocos ---------- */
  function setProduct(id: ProductId, on: boolean, animate: boolean): void {
    const attr = `data-${id}`;
    if (form.hasAttribute(attr) === on) return;
    const block = $(`[data-block="${id}"]`);
    if (!block || !animate || reduceMotion()) {
      form.toggleAttribute(attr, on);
      if (!booting) ScrollTrigger.refresh();
      return;
    }
    gsap.killTweensOf(block);
    if (on) {
      form.setAttribute(attr, '');
      gsap.from(block, {
        height: 0,
        autoAlpha: 0,
        y: 12,
        duration: 0.55,
        ease: EASE.soft,
        clearProps: 'height,opacity,visibility,transform,overflow',
        onStart: () => gsap.set(block, { overflow: 'hidden' }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else {
      gsap.to(block, {
        height: 0,
        autoAlpha: 0,
        overflow: 'hidden',
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          form.removeAttribute(attr);
          gsap.set(block, { clearProps: 'height,opacity,visibility,overflow' });
          ScrollTrigger.refresh();
        },
      });
    }
  }

  function applyProducts(sel: OrderSelection): void {
    PRODUCTS.forEach((id) => setProduct(id, sel.products[id], !booting));
    // Leitor de tela: "Etapa 2 de 7:" nas etapas visíveis (o numeral vem do CSS)
    const visible = $$<HTMLElement>('.order-step').filter((step) => !step.closest('[data-block]') || sel.products[step.closest<HTMLElement>('[data-block]')?.dataset.block as ProductId]);
    const shown = visible.filter((step) => step.id !== 'etapa-retirada' || sel.products.cake || sel.products.sweets);
    $$<HTMLElement>('.order-step').forEach((step) => {
      const sr = step.querySelector('[data-step-sr]');
      const i = shown.indexOf(step);
      if (sr) sr.textContent = i >= 0 ? `Etapa ${i + 1} de ${shown.length}:` : '';
    });
  }

  /* ---------- Erros ---------- */
  const groupKeys = new Set(['product', 'decoration', 'size', 'dough', 'filling', 'period', 'sweets']);
  const isCatKey = (key: string): boolean => key.startsWith('sweet-cat-');

  function controlsOf(key: string): HTMLElement[] {
    if (key === 'sweets') return $$<HTMLInputElement>('[data-sweet-cat] .qty__input');
    if (isCatKey(key)) return $$<HTMLInputElement>(`[data-sweet-cat="${key.slice('sweet-cat-'.length)}"] .qty__input`);
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
    if (isCatKey(key)) slot?.closest('.sweet-cat')?.classList.remove('is-invalid');
  }

  function showError(key: string, message: string): void {
    const slot = $(`[data-error-for="${key}"]`);
    if (slot) {
      slot.textContent = message;
      slot.hidden = false;
    }
    controlsOf(key).forEach((c) => c.setAttribute('aria-invalid', 'true'));
    if (groupKeys.has(key)) slot?.closest('fieldset')?.classList.add('is-invalid');
    if (isCatKey(key)) slot?.closest('.sweet-cat')?.classList.add('is-invalid');
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
          const target = groupKeys.has(key) ? el.closest('fieldset') : isCatKey(key) ? el.closest('.sweet-cat') : el;
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
    const details = el.closest('details');
    if (details) details.open = true;
    const target = el.closest('.sweet-cat') ?? el.closest('fieldset.order-step') ?? el;
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }

  /* ---------- Rascunho ---------- */
  function saveDraft(): void {
    try {
      const entries = Array.from(new FormData(form).entries())
        .map(([k, v]) => [k, String(v)])
        .filter(([, v]) => v !== '0'); // quantidades zeradas não precisam ir para o rascunho
      entries.unshift(['_v', DRAFT_VERSION]);
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
    const v2 = entries.some(([name]) => name === '_v');
    if (!v2 && entries.length) entries.push(['product', 'cake']); // rascunho antigo: só bolo
    // Mantém o que o link de origem (?pedido=) já marcou no script inline
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
    applyProducts(sel);
    applyMinDate(sel);
    applyFillingLimit(sel);
    applySweets(sel);
    applyAsks(sel);
    const summary = orderSummary(sel);
    renderGroups(summary);
    renderSubtotals(summary);
    renderPickup(sel);
    setTotal(summary.total);
    if (barLabel) barLabel.textContent = orderShortLabel(sel) || 'Total estimado';
    $$<HTMLTextAreaElement>('textarea[maxlength]').forEach((area) => {
      const counter = $(`[data-counter-for="${area.id}"]`);
      if (counter) counter.textContent = `${area.value.length}/${area.maxLength}`;
    });
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

  /* ---------- Seletores de quantidade ---------- */
  form.addEventListener('click', (ev) => {
    const btn = (ev.target as Element).closest<HTMLButtonElement>('[data-qty-step]');
    if (!btn) return;
    const input = btn.closest('[data-qty]')?.querySelector<HTMLInputElement>('input');
    if (!input) return;
    const dir = Number(btn.dataset.qtyStep);
    const current = snapQty(Number(input.value) || 0);
    const next = dir > 0 ? snapQty(current + partySweets.rules.step) : Math.max(0, current - partySweets.rules.step);
    if (next === Number(input.value)) return;
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Valor digitado: arredonda para o múltiplo de 25 ao sair do campo
  form.addEventListener('change', (ev) => {
    const input = ev.target as HTMLInputElement;
    if (!input.classList?.contains('qty__input')) return;
    const snapped = snapQty(Number(input.value));
    if (String(snapped) !== input.value) input.value = String(snapped);
  }, true);

  // Cereja sem mini brownie: não marca (avisa)
  form.addEventListener('click', (ev) => {
    const input = ev.target as HTMLInputElement;
    if (input?.name === SWEET_EXTRA && input.getAttribute('aria-disabled') === 'true') {
      ev.preventDefault();
      if (extraSweetNote) extraSweetNote.hidden = false;
    }
  });

  /* ---------- "Remover" no cabeçalho do bloco ---------- */
  form.addEventListener('click', (ev) => {
    const btn = (ev.target as Element).closest<HTMLButtonElement>('[data-remove-product]');
    if (!btn) return;
    const input = $<HTMLInputElement>(`input[name="product"][value="${btn.dataset.removeProduct}"]`);
    if (!input) return;
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.focus({ preventScroll: true });
    $('#etapa-produtos')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- Atalhos do cabeçalho da página (#bloco-bolo, #bloco-docinhos) ---------- */
  document.addEventListener('click', (ev) => {
    const link = (ev.target as Element).closest<HTMLAnchorElement>('a[href^="#bloco-"], a[href="#etapa-retirada"]');
    if (!link) return;
    const id = link.hash === '#bloco-bolo' ? 'cake' : link.hash === '#bloco-docinhos' ? 'sweets' : null;
    const sel = read();
    if (id && !sel.products[id]) {
      const input = $<HTMLInputElement>(`input[name="product"][value="${id}"]`);
      if (input) {
        input.checked = true;
        update();
      }
    } else if (!id && !sel.products.cake && !sel.products.sweets) {
      ev.preventDefault();
      $('#etapa-produtos')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (id) {
      ev.preventDefault();
      const block = document.getElementById(link.hash.slice(1));
      block?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      block?.querySelector<HTMLElement>('.order-block__title')?.focus({ preventScroll: true });
    }
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
    // Conversão (GA4, se ativo — ui/Analytics.astro)
    const items = PRODUCTS.filter((p) => sel.products[p]);
    document.dispatchEvent(
      new CustomEvent('nicakes:order-submit', { detail: { total: orderSummary(sel).total, items, sweets: sweetsCount(sel) } }),
    );
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
    $<HTMLElement>('#etapa-produtos')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- Barra do celular: some quando o resumo está na tela ---------- */
  const summary = document.getElementById('resumo');
  if (bar && summary && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => bar.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.15 }).observe(summary);
  }

  restoreDraft();
  // Estado inicial sem animar o total
  const initial = orderSummary(read());
  lastTotal = initial.total;
  [totalEl, barTotal].forEach((el) => el && (el.textContent = formatPrice(lastTotal)));
  lastLines = new Set(initial.groups.flatMap((g) => g.lines.map((l) => l.key)));
  update({ save: false });
  booting = false;
}
