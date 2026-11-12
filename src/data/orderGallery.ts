/**
 * Fotos das encomendas (bolos de aniversário e docinhos) — fonte única do
 * slider (ui/CakeSlider) nas seções de encomenda: home, /cardapio#bolos e
 * /encomendas. `kind` diz o produto; cada seção escolhe quais mostra
 * (`galleryFor`), e o slider misto intercala bolo e docinho.
 *
 * Cada foto existe em até 3 larguras em /public/images/encomendas/:
 * `<slug>.webp` (a maior, 1920 por padrão) · `<slug>-1280.webp` · `<slug>-640.webp`,
 * todas no mesmo recorte (~16:9, 1920×1072). Foto com original menor (ex.: as
 * dos docinhos, 1280 px) informa `full` e só tem as larguras abaixo dela — sem
 * ampliar a imagem.
 * `focus` é o centro do bolo (object-position): espaços mais estreitos cortam
 * as laterais do cenário, nunca o bolo. Para trocar/incluir/reordenar fotos,
 * edite só esta lista. Fotos de docinhos: `kind: 'sweets'` e prefixo
 * `docinhos-` no slug (fotos reais de pedidos, convertidas de
 * assets-originais/encomendas/docinhos/).
 */
export type GalleryKind = 'cake' | 'sweets';

export const GALLERY_KIND_LABEL: Record<GalleryKind, string> = {
  cake: 'Bolo de aniversário',
  sweets: 'Docinhos',
};

export interface GalleryPhoto {
  slug: string;
  kind: GalleryKind;
  alt: string;
  /** object-position — centro do produto */
  focus: string;
  /** Largura do `<slug>.webp` quando menor que GALLERY_SIZES.full */
  full?: number;
}

export const GALLERY_SIZES = { full: 1920, widths: [640, 1280] as const, height: 1072 };

export const orderGallery: GalleryPhoto[] = [
  {
    kind: 'cake',
    slug: 'bolo-flores-do-campo',
    alt: 'Bolo branco decorado com flores do campo coloridas em chantilly e frase escrita no topo, sobre boleira branca',
    focus: '48% 45%',
  },
  {
    kind: 'cake',
    slug: 'bolo-country-lacos',
    alt: 'Bolo branco com estampa country de botas e ferraduras, babados de chantilly e laços de fita marrom',
    focus: '50% 50%',
  },
  {
    kind: 'cake',
    slug: 'bolo-vintage-feliz-aniversario',
    alt: 'Bolo vintage branco com bicos verdes e laços vermelhos e “Feliz Aniversário” escrito no topo',
    focus: '50% 52%',
  },
  {
    kind: 'cake',
    slug: 'bolo-vintage-pastel',
    alt: 'Bolo vintage branco com bicos em azul, verde e rosa, guirlandas de florzinhas e rosas de chantilly no topo',
    focus: '50% 55%',
  },
  {
    kind: 'cake',
    slug: 'bolo-azul-patinho',
    alt: 'Bolo azul decorado com vitórias-régias verdes e um patinho amarelo no topo',
    focus: '45% 45%',
  },
  {
    kind: 'cake',
    slug: 'bolo-verde-borboletas',
    alt: 'Bolo verde-sálvia com flores de chantilly em pêssego e amarelo e borboletas lilás',
    focus: '50% 55%',
  },
  {
    kind: 'cake',
    slug: 'bolo-tres-andares',
    alt: 'Bolo de três andares branco, com rendas de chantilly e flores bordô pintadas à mão',
    focus: '47% 55%',
  },
  {
    kind: 'sweets',
    slug: 'docinhos-brigadeiros-bandeja-cristal',
    alt: 'Pedido personalizado de docinhos: bandeja de cristal com brigadeiros brancos decorados com rosinhas de chocolate',
    focus: '50% 55%',
    full: 1280,
  },
  {
    kind: 'sweets',
    slug: 'docinhos-ninho-nutella-ferrero',
    alt: 'Pedido personalizado de docinhos em forminhas, vistos de cima: brigadeiros brancos com Nutella, marmorizados com coração dourado e cobertos de amendoim',
    focus: '50% 50%',
    full: 1280,
  },
  {
    kind: 'sweets',
    slug: 'docinhos-personalizados-formatura',
    alt: 'Pedido personalizado de docinhos para formatura: caixa de brigadeiros com letras, capelos e diplomas de açúcar',
    focus: '50% 50%',
    full: 1280,
  },
  {
    kind: 'sweets',
    slug: 'docinhos-sortidos-caixa',
    alt: 'Pedido personalizado de docinhos: caixa com fileiras de brigadeiros granulados, docinhos verdes, docinhos com pipeta e com bico de doce de leite',
    focus: '50% 50%',
    full: 1280,
  },
  {
    kind: 'sweets',
    slug: 'docinhos-brigadeiros-granulados',
    alt: 'Pedido personalizado de docinhos: bandeja espelhada com brigadeiros de chocolate granulado intercalados com brigadeiros brancos com raspas',
    focus: '50% 55%',
    full: 1280,
  },
];

/** Máximo de fotos no slider misto (a barra de progresso é segmentada). */
export const MIXED_MAX = 10;

/**
 * Fotos de uma seção: só os tipos pedidos e, com mais de um tipo, intercaladas
 * (bolo, docinho, bolo…) até `MIXED_MAX`.
 */
export function galleryFor(kinds: GalleryKind[] = ['cake']): GalleryPhoto[] {
  const lists = kinds.map((k) => orderGallery.filter((p) => p.kind === k)).filter((l) => l.length);
  if (lists.length < 2) return lists[0] ?? [];
  const out: GalleryPhoto[] = [];
  for (let i = 0; out.length < MIXED_MAX && lists.some((l) => i < l.length); i += 1) {
    for (const l of lists) if (i < l.length && out.length < MIXED_MAX) out.push(l[i]);
  }
  return out;
}

const base = (slug: string): string => `/images/encomendas/${slug}`;
export const photoSrc = (p: GalleryPhoto): string => `${base(p.slug)}.webp`;
export const photoSrcset = (p: GalleryPhoto): string => {
  const full = p.full ?? GALLERY_SIZES.full;
  return [
    ...GALLERY_SIZES.widths.filter((w) => w < full).map((w) => `${base(p.slug)}-${w}.webp ${w}w`),
    `${base(p.slug)}.webp ${full}w`,
  ].join(', ');
};
