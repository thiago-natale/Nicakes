/** Textos da seção "Docinhos de festa" do /cardapio (regras de data/menu.ts). */
import { partySweets } from '../../../data/menu';

const { minTotal, step, unit, leadBusinessDays } = partySweets.rules;

/** "Pedido mínimo de 50 docinhos (somando os tipos) · de 25 em 25 por sabor · 2 dias de antecedência" */
export const sweetsRules = `Pedido mínimo de ${minTotal} docinhos (somando os tipos) · de ${step} em ${step} por sabor, até ${
  unit / step
} sabores a cada ${unit} · ${leadBusinessDays} dias de antecedência · retirada na loja.`;
