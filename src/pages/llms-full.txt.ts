/** /llms-full.txt — resumo da marca em Markdown para assistentes de IA (data/llms.ts). */
import type { APIRoute } from 'astro';
import { llmsFullTxt } from '../data/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsFullTxt(site), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
