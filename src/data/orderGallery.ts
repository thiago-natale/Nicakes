/**
 * Fotos dos bolos de aniversário feitos sob encomenda — fonte única do slider
 * (ui/CakeSlider) nas seções de encomenda: home, /cardapio#bolos e /encomendas.
 *
 * Cada foto existe em 3 larguras em /public/images/encomendas/:
 * `<slug>.webp` (1920) · `<slug>-1280.webp` · `<slug>-640.webp`, todas 16:9.
 * `focus` é o centro do bolo (object-position): espaços mais estreitos cortam
 * as laterais do cenário, nunca o bolo. Para trocar/incluir/reordenar fotos,
 * edite só esta lista.
 */
export interface GalleryPhoto {
  slug: string;
  alt: string;
  /** object-position — centro do bolo */
  focus: string;
}

export const GALLERY_SIZES = { full: 1920, widths: [640, 1280] as const, height: 1072 };

export const orderGallery: GalleryPhoto[] = [
  {
    slug: 'bolo-flores-do-campo',
    alt: 'Bolo branco decorado com flores do campo coloridas em chantilly e frase escrita no topo, sobre boleira branca',
    focus: '48% 45%',
  },
  {
    slug: 'bolo-country-lacos',
    alt: 'Bolo branco com estampa country de botas e ferraduras, babados de chantilly e laços de fita marrom',
    focus: '50% 50%',
  },
  {
    slug: 'bolo-vintage-feliz-aniversario',
    alt: 'Bolo vintage branco com bicos verdes e laços vermelhos e “Feliz Aniversário” escrito no topo',
    focus: '50% 52%',
  },
  {
    slug: 'bolo-vintage-pastel',
    alt: 'Bolo vintage branco com bicos em azul, verde e rosa, guirlandas de florzinhas e rosas de chantilly no topo',
    focus: '50% 55%',
  },
  {
    slug: 'bolo-azul-patinho',
    alt: 'Bolo azul decorado com vitórias-régias verdes e um patinho amarelo no topo',
    focus: '45% 45%',
  },
  {
    slug: 'bolo-verde-borboletas',
    alt: 'Bolo verde-sálvia com flores de chantilly em pêssego e amarelo e borboletas lilás',
    focus: '50% 55%',
  },
  {
    slug: 'bolo-tres-andares',
    alt: 'Bolo de três andares branco, com rendas de chantilly e flores bordô pintadas à mão',
    focus: '47% 55%',
  },
];

const base = (slug: string): string => `/images/encomendas/${slug}`;
export const photoSrc = (p: GalleryPhoto): string => `${base(p.slug)}.webp`;
export const photoSrcset = (p: GalleryPhoto): string =>
  [...GALLERY_SIZES.widths.map((w) => `${base(p.slug)}-${w}.webp ${w}w`), `${base(p.slug)}.webp ${GALLERY_SIZES.full}w`].join(', ');
