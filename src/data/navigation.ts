/**
 * Itens do header (âncoras da landing), na ordem das seções da home:
 * Hero · A Nicake’s · Mais pedidos (+ Para adoçar o seu dia) · Prévia do cardápio ·
 * Encomendas · Loja · (Depoimentos, fora do menu) · FAQ · Contato.
 * Na home viram `#id`; nas demais páginas, `/#id`.
 */
export const navigation = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'A Nicake’s' },
  { id: 'delicias', label: 'Delícias' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'encomendas', label: 'Encomendas' },
  { id: 'loja', label: 'Loja' },
  { id: 'faq', label: 'Dúvidas' },
  { id: 'contato', label: 'Contato' },
] as const;

export type NavigationId = (typeof navigation)[number]['id'];
