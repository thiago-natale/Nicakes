/**
 * Marca — nome, grafias, frase canônica e temas.
 * Usado em: layout (Open Graph), header, logo, hero, rodapé, schema e llms.txt.
 */
export const brand = {
  name: 'Nicake’s',
  fullName: 'Nicake’s Confeitaria',
  /**
   * Grafias com que a marca é buscada (schema: alternateName da confeitaria e
   * do site). "Nicakes", sem apóstrofo, é como muita gente digita.
   */
  alternateNames: ['Nicake’s', "Nicake's", 'Nicakes', 'Nicakes Confeitaria', 'Nicake’s Confeitaria'],
  tagline: 'Confeitaria',
  /**
   * Frase canônica da marca (GEO/SEO) — use EXATAMENTE este texto onde a marca
   * for definida: topo da home, meta description da home, llms.txt e schema.
   */
  description:
    'A Nicake’s Confeitaria é uma confeitaria artesanal em Uberaba-MG que faz bolos de aniversário sob encomenda, doces, salgados e café para o dia a dia e festas.',
  manifesto: 'Carinho que se transforma em doçura.',
  /**
   * Temas que a marca domina (schema `knowsAbout` e llms.txt) — só o que o
   * site oferece de fato.
   */
  knowsAbout: [
    'Confeitaria artesanal',
    'Bolos de aniversário sob encomenda',
    'Bolo vintage',
    'Decoração com chantilly, butter cream e ganache',
    'Cakes em fatia',
    'Donuts recheados',
    'Brownies',
    'Salgados',
    'Cafés e milk-shakes',
  ],
  // GEO: inserir dado real aqui — ano de fundação (foundingDate) e nome de quem
  // fundou (founder). Ficam fora do site e do schema até serem informados.
  foundingDate: undefined as string | undefined,
} as const;
