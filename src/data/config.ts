/**
 * Configuração pública lida no build — verificações de propriedade e Analytics.
 * Defina no ambiente (.env ou painel da Vercel); veja .env.example.
 * URL do site e chave do IndexNow ficam em site.config.mjs (raiz).
 */
export const publicEnv = {
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION as string | undefined,
  bingSiteVerification: import.meta.env.PUBLIC_BING_SITE_VERIFICATION as string | undefined,
  ga4Id: import.meta.env.PUBLIC_GA4_ID as string | undefined,
} as const;
