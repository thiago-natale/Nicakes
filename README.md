# Nicake’s Confeitaria — site

Landing page e cardápio da Nicake’s Confeitaria (Uberaba-MG).
Stack: **Astro (SSG) + Tailwind CSS v4 + TypeScript**.

## Como rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # gera /dist (site estático) e roda a checagem de SEO (scripts/check-seo.mjs)
npm run preview   # serve o /dist — use este (e não o dev) para medir performance
npm run check     # checagem de tipos do Astro/TypeScript
npm run format    # formata o código com Prettier (format:check só confere)
```

Copie `.env.example` para `.env` para ativar verificações do Search Console/Bing e o GA4.
A URL do site e a chave do IndexNow ficam em `site.config.mjs` (único lugar).

### Convenções de código

- **Imports:** use o alias `@/` para sair da pasta (`import { hours } from '@/data/hours'`); dentro da mesma pasta, `./arquivo`.
- **Arquivos de uma seção** (`src/components/sections/<Seção>/`):
  - `Secao.astro`: marcação;
  - `secao.ts`: textos e dados da seção;
  - `secao.motion.ts`: animação (GSAP), carregada sob demanda;
  - `secao.client.ts`: comportamento no navegador (menu, acordeão, carrossel, formulário, vídeo);
  - `secao.css`: estilos em BEM que o Tailwind não resolve.
- **Nomes:** `PascalCase` para `.astro`; `camelCase` para `.ts` e `.css`.
- **Eventos customizados:** declarados em `EVENTS` (`src/scripts/motion/config.ts`), com prefixo `nicakes:`. O preloader e o vídeo do hero repetem o texto literal de propósito, para os scripts continuarem inline no HTML.

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Landing page |
| `/cardapio` | Cardápio completo + bolos de aniversário e docinhos |
| `/encomendas` | Monte seu bolo e escolha os docinhos → WhatsApp |
| `/privacidade`, `/termos` | Textos-base (revisar com a Nicake’s) |
| `/404` | Página não encontrada (noindex) |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | Gerados no build a partir de `src/data/` |

## Onde editar o conteúdo

Todas as informações do site ficam em `src/data/`, um arquivo por categoria. Mude lá e o site inteiro (seções, FAQ, schema, llms.txt) acompanha.

| O quê | Arquivo |
|---|---|
| Nome, grafias da marca, frase canônica, manifesto, temas (`knowsAbout`) | `src/data/brand.ts` |
| Telefone/WhatsApp (guardado uma vez, em E.164) e links com mensagem pronta (`whatsappLink()`, `whatsappOrderLink()`) | `src/data/contact.ts` |
| Endereço e link do mapa | `src/data/location.ts` |
| Horários (dias + abertura/fechamento; os textos e o schema são calculados) | `src/data/hours.ts` |
| Instagram, iFood e ícones do rodapé | `src/data/social.ts` |
| CNPJ e ano do © | `src/data/legal.ts` |
| Links do menu (header) | `src/data/navigation.ts` |
| Título, descrição e data de atualização de cada página | `src/data/seo.ts` |
| Cardápio completo, preços, bolos de aniversário e docinhos | `src/data/menu.ts` |
| Fotos da galeria de encomendas | `src/data/orderGallery.ts` |
| Perguntas frequentes (home, cardápio e encomendas) | `src/data/faq.ts` |
| Verificações (Search Console/Bing) e GA4 | `.env` (ver `.env.example`; lidos em `src/data/config.ts`) |
| URL do site e chave do IndexNow | `site.config.mjs` |
| Textos de cada seção (títulos, chamadas) | `src/components/sections/<Seção>/<seção>.ts` |
| Itens exibidos na prévia do cardápio da landing | `src/components/sections/MenuPreview/menuPreview.ts` (puxa preços de `menu.ts`) |
| Seção «A Nicake’s» (manifesto, história, promessas; números calculados) | `src/components/sections/About/about.ts` |
| Depoimentos «Memórias que adoçam» (comentários reais do Instagram) | `src/components/sections/Testimonials/testimonials.ts` |

Arquivos **derivados** (não guardam valores próprios, só montam a partir dos outros): `src/data/schema.ts` (JSON-LD) e `src/data/llms.ts` (llms.txt).
Formatadores genéricos (preço, kg, data, telefone, hora) ficam em `src/lib/format.ts`.

## Estrutura

```text
src/
  components/
    sections/   Header · Hero · About · Bestsellers · Recommended · MenuPreview ·
                CustomOrders · Store · Testimonials · Faq · Contact · Footer · MenuHeader · MenuCategory ·
                BirthdayCakes · LegalContent
                OrderHeader · OrderForm · PartySweets · NotFound · Preloader
    ui/         Button · Logo · BrandSeal · Icon · ProductCard · MenuList · SectionDivider ·
                Eyebrow · SectionHeading · Swash · Breadcrumbs · CakeSlider · ChoiceCard ·
                FormField · QuantityStepper · StepBadge · Analytics
  data/         brand · contact · location · hours · social · legal · navigation · seo ·
                menu · orderGallery · faq · images · config · schema (derivado) · llms (derivado)
  lib/          format.ts (preço, kg, data, telefone, hora)
  layouts/      BaseLayout (head, SEO, schema.org) · SiteLayout (moldura, header, rodapé)
  pages/        index · cardapio · encomendas · privacidade · termos · 404 ·
                sitemap.xml · robots.txt · llms.txt · llms-full.txt
  scripts/      motion/ (núcleo das animações GSAP; cada seção tem o seu *.motion.ts)
  styles/       global.css (tokens @theme + componentes)
scripts/        check-seo.mjs (roda no build) · indexnow.mjs (roda no deploy, via GitHub Actions)
assets-originais/  originais e arquivos fora de uso (não vão para o site; fora do git)
public/
  brand/        logos (colorido e branco), ícone
  images/       fotos dos produtos (WebP)
  favicon-32.png · apple-touch-icon.png · icon-512.png · og-image.jpg
```

## Identidade visual

- **Cores oficiais:** rosa queimado `#DA8D8C`, verde-sálvia `#939B80`, rosa-claro `#FFE8EB`, dourado `#B99457`.
- **Tons de apoio para contraste (AA):** `rose-deep #A9605E` (fundo dos botões), `rose-darker #924F4D` (textos pequenos em rosa), `sage-deep #6B7358` (ícones e botões secundários), `cocoa #3A2A2C` (texto).
- O dourado é usado só em linhas e ornamentos, nunca em texto.
- **Fontes:** Cormorant Garamond (títulos e chamadas) e Jost (textos, menus e controles), servidas localmente em `public/fonts` (variáveis, subset latino, licença OFL).
- Os logos vêm dos PNGs da marca, convertidos para WebP. Se a versão em SVG ficar pronta, substitua os arquivos em `public/brand/`.

## Layout responsivo

- **Breakpoints** (`global.css` › `@theme` e `scripts/motion/config.ts` › `MEDIA`): `md` 48rem (768px, tablet: header com menu completo e hero em 2 colunas) · `lg` 56.25rem (900px, layout desktop) · `xl` 80rem · `ultra` 137.5rem (2200px). Nos `.css` de seção, use esses mesmos valores.
- **Até 899px:** layout de celular/tablet, com fonte base de 18px.
- **900px até 2199px:** a superfície rosa-clara ocupa a tela de ponta a ponta, sem moldura nem cantos arredondados. As seções usam colunas fluidas, e a tipografia cresce devagar (16px em 941px, até 20px).
- **2200px ou mais:** o fundo continua de ponta a ponta e o conteúdo fica centralizado em até 2000px (`--frame-max-ultra`), via `--content-px`/`--section-px`.
- **Header fixo:** a primeira seção de cada página (Hero, cabeçalho do cardápio e páginas legais) reserva o espaço do header com `padding-top: var(--header-height)`.
- **Espaçamentos laterais:** use os utilitários `section-x` (painéis e cards) e `content-x` (textos, header, hero e seções abertas). Dentro de painéis, `panel-x`/`panel-y`.
- **Hero:** as medidas da coluna da mídia ficam em `Hero/hero.css` (`--hero-*`). O `HeroBackdrop` usa essas mesmas variáveis para desenhar as curvas.

## Design system — regras de padronização

Plano e auditoria: `claude/plano-padronizacao-design.md` (projeto). Regras em vigor:

- **Cabeçalho de seção:** sempre `ui/SectionHeading.astro`.
  - `align="start"` (editorial: Delícias, Encomendas, Loja, FAQ, Contato): eyebrow + título + destaque em itálico + lead.
  - `align="center"` (catálogo: Recomendados, Cardápio, Depoimentos): eyebrow centralizado + título entre linhas douradas com corações.
  - `tone="sage"` sobre painel sálvia sólido (cacau no lugar do rosa, para contraste AA).
  - Eyebrow avulso: `ui/Eyebrow.astro` (Hero, Sobre, /cardapio).
- **Tipografia** (utilitários no `global.css`, nada de `text-[…]` soltos nas seções):
  - `type-section`: todo `<h2>` de seção;
  - `type-panel`: títulos dentro de cartões;
  - `type-body`: texto corrido e lead;
  - `type-small`: descrições de card;
  - `type-eyebrow`: o chapéu.
  - Tamanhos de interface: classes `text-*` geradas pelos tokens de `@theme` (`text-fine`, `text-label`, `text-detail`, `text-crumb`, `text-meta`, `text-control`, `text-item`, `text-copy-sm`, `text-subtitle`, `text-price`, `text-page-sm`, `text-page`, `text-page-lg`). Se faltar um tamanho, crie o token.
  - Exceções de propósito (únicos `text-[…]` do projeto): o header (medidas em px da origem), o preloader, o título do hero, o manifesto, os numerais e os números do Sobre, o numeral do `StepBadge` e as aspas e o texto dos depoimentos.
- **Ritmo vertical:** cada seção leva `section-y` no topo (`--section-gap`), sem padding-bottom. Blocos de catálogo encadeados (Recomendados → Cardápio) usam `section-y-tight`.
- **Linha de texto:** no desktop, todo texto começa na mesma coluna. `--panel-px` = `--content-px` − `--section-px`, então o texto dentro dos painéis alinha com o das seções abertas.
- **Superfícies:**
  - `bg-sage`: vitrine (Delícias);
  - `bg-blush`: encomenda;
  - `bg-sage-mist`: lugar (Loja);
  - cards `bg-white/70`: catálogo;
  - aberto: Depoimentos e FAQ;
  - `bg-white`: fechamento (Contato).
  - Formas de borda sálvia: Depoimentos à direita e FAQ à esquerda, alternando os lados.
- **Botões:**
  - `primary` para conversão (WhatsApp, pedir, encomendar);
  - `outline`/`light` para navegar no catálogo;
  - `sage` para lugar ("Como chegar").
  - Tamanho `md` nas seções; `sm` só no header e em cards. `pill` só no header.
  - Link de texto: `.text-link` (com `Icon name="arrow" class="text-link__icon"`).
- **Ícones:** vantagens em `.icon-circle` (blush + rosa); informações (endereço, contatos) em sálvia-escuro, sem fundo.
- **Sombras e raios:** só por tokens (`shadow-soft`, `shadow-panel`, `shadow-cta`, `shadow-plate`, `shadow-control`; `rounded-panel`, `rounded-card`, `rounded-control`).
- **Animação:** cabeçalhos com `headingIn()` (`scripts/motion/heading.ts`); disparos `START.heading` (`top 80%`) e `START.list` (`top 85%`) em `config.ts`.

## Performance (out/2026)

Plano e diagnóstico: `claude/plano-performance.md` (projeto). A mesma animação roda no desktop e no celular, com estes cuidados:

- **Preloader em CSS puro** (`Preloader/preloader.css`): começa no 1º quadro, sem esperar o JS. O `preloader.client.ts` (sem GSAP) só abre os painéis quando o logo terminou e as animações estão prontas.
  - Na 1ª visita, o hero é pintado por baixo do preloader; o poster do vídeo é o LCP.
- **Vídeo do hero:**
  - versões comprimidas, celular 480p (~370 KB) e desktop 720p (~1,2–1,4 MB), WebM + MP4, sem áudio;
  - `preload="none"`: baixa só quando a entrada termina;
  - poster WebP de 22 KB (1º quadro).
  - O original `Chocolate_pouring.mp4` (6,6 MB) não é mais usado.
- **Animações sob demanda** (`scripts/motion/index.ts`):
  - Hero e Header iniciam no boot; as Encomendas também, no desktop, por causa do pin.
  - As outras seções têm o código num chunk próprio (`import()`), montado quando chegam perto da tela (`onApproach`, em `lazy.ts`) ou em momentos ociosos depois da 1ª interação.
  - O carrossel dos depoimentos (Flip) também é carregado sob demanda.
- **Selo da marca:** o anel gira com `@keyframes` CSS (`.css-spin`, via `cssSpin()`), só no compositor. O giro antigo via SVG custava ~45% da CPU parada.
- **Fontes:** WOFF2 com subset pt-BR e só as features usadas (−52%); o WOFF fica de reserva.
- **Imagens:** versões `-280`/`-640` + `srcset`/`sizes` (`data/images.ts` → `srcsetOf()`).
- **Medição local:** use sempre `npm run build && npm run preview` (nunca o `npm run dev`).

## Header e preloader (portados de `C:\Sites\Nicakes`)

- **Header** (`sections/Header/`): fixo no topo, com medidas em px idênticas à origem.
  - Menu móvel em `<dialog>` e destaque da seção visível.
  - Arquivos: `header.client.ts` (menu e seção ativa), `headerIntro.motion.ts` (entrada), `headerMenu.motion.ts` (abertura do menu) e `headerProgress.motion.ts` (barra de rolagem).
  - Barra de progresso da rolagem (GSAP ScrollTrigger, carregado sob demanda).
  - `--header-height` é medido via JS e empurra o conteúdo para baixo do header.
  - Os itens ficam em `src/data/navigation.ts`: Início · A Nicake’s · Delícias · Cardápio · Encomendas · Loja · Dúvidas · Contato (Depoimentos segue na página, fora do menu).
- **Preloader** (`sections/Preloader/`): aparece só na home, na primeira visita da sessão (`sessionStorage`).
  - Animação de ~4s com GSAP + SplitText. Com movimento reduzido, vira uma versão estática de 2s.
  - Ao terminar, dispara `nicakes:preloader-complete`, e o header faz a sua entrada.
- **Button (`ui/Button.astro`):** `variant` (primary · light · sage · outline), `size` (sm · md · lg), `shape` (rounded · pill), `icon`/`iconEnd` (nomes do `Icon`), `disabled`. Estilos em `global.css` (`.btn`, BEM, tokens `--btn-*`): estados hover/active/focus-visible/disabled, área de toque ≥ 44px, contraste AA e aviso "abre em nova aba" em links externos.

## Nossa loja (`sections/Store/`, id `#loja`)

Trazida do projeto `C:\Nicakes-new` (`#loja`) e adaptada ao design system. Fica logo após Encomendas.

- **Layout:** painel sálvia-névoa. À esquerda: eyebrow, título "Fique mais *um pouquinho.*", texto, endereço e o botão "Como chegar" (abre o mapa). À direita: um cartão-convite creme, levemente inclinado, com moldura dourada dupla, ilustração de café, "Seu tempo merece *uma pausa doce.*" (com floreio) e os horários vindos de `site.ts`.
- **Animação:** o painel abre de baixo para cima, o eyebrow e o título seguem o padrão das outras seções e o pin do endereço quica. No cartão, a moldura e o café são desenhados a traço, o floreio escorre e cada horário entra com sua linha. No desktop, o cartão se endireita com o scroll; o vapor do café fica em loop (pausado fora da tela).

## Animações (GSAP)

Coreografia "feita à mão, com calda": timelines GSAP com ScrollTrigger, SplitText, DrawSVG, MorphSVG, MotionPath e ScrambleText. Plano completo em `claude/plano-animacoes-gsap.md` (projeto).

- **Núcleo:** `src/scripts/motion/`
  - `index.ts` é o boot. Registra os plugins e os eases, espera as fontes, cria um único `gsap.matchMedia()` (`isDesktop` ≥ 900px, `isMobile`, `reduceMotion`) e inicia as seções em ordem de página.
  - `eases.ts` define os eases da marca: `nicakes.soft`, `nicakes.drip`, `nicakes.pop` e `nicakes.squash` (CustomBounce).
  - Helpers: `split.ts` (SplitText com máscara, revertido ao fim), `draw.ts` (ícones e linhas desenhados), `counters.ts` (entrada dos preços), `divider.ts` (SectionDivider), `menu.ts` (cards do cardápio) e `utils.ts`.
  - `reveal.ts` é o sinal de início: o preloader dispara `nicakes:preloader-reveal` quando os painéis começam a abrir, e o hero e o header entram juntos.
- **Por seção:** `<Seção>/<seção>.motion.ts` exporta `initMotion(root, condições, ordem)`. A raiz da seção leva `data-motion-section="nome"` e os alvos levam `data-motion="..."`; não amarre animações a classes de estilo.
- **Nova seção:**
  1. Marque a raiz com `data-motion-section`.
  2. Crie o `.motion.ts` na pasta da seção.
  3. Registre-o em `SECTIONS` (`index.ts`), na ordem da página.
  4. Use `onceInView()` para entradas e `scrub` apenas dentro de `c.isDesktop`.
- **Desktop × celular:** pin (Encomendas), scrub e parallax só no desktop. No celular as entradas ficam mais curtas e sem pin.
- **Movimento reduzido:** nenhuma divisão de texto, morph, pin ou parallax; apenas um fade de 0,3s por bloco.
- **Sem flash:** só os elementos com `data-motion-hero` ficam ocultos até `html.motion-ready`. Um timeout de 3s no `BaseLayout` libera tudo se o JS falhar.
- **Loops** (anel do selo, vapor da xícara, ícone do contato) pausam fora da tela.
- **Desempenho do hero:**
  - a entrada só começa depois do boot de todas as seções (`whenReadyToPlay`);
  - o morph do fundo vem antes do recorte do vídeo;
  - durante a revelação a sombra da moldura fica desligada (`.is-revealing`) e o vídeo fica no poster; ele começa a tocar no evento `nicakes:hero-media-revealed`;
  - todos os `ScrollTrigger.refresh()` passam por `scripts/motion/refresh.ts` (debounce), que espera a entrada terminar.

## Pendências

- **Seção Sobre:** fotos da colagem provisórias (trocar por bastidores reais) e história sem ano/nome de quem fundou (incluir em `About/about.ts` e `data/brand.ts` › `foundingDate`; depois, opcionalmente, uma assinatura).
- **Fotos:** as atuais foram geradas por IA. Troque por fotos reais quando possível, mantendo nomes e proporções.
- **Textos legais** (`/privacidade` e `/termos`): textos-base, revisar com a Nicake’s (responsável e contato LGPD).
