import { ENV } from "../../../scripts/envBootstrap.js";
export const aiConfig = {
  models: {
    google: { name: ENV.ai.providers.google.model, apiKey: ENV.ai.providers.google.key },
    chatgpt: { name: ENV.ai.providers.chatgpt.model, apiKey: ENV.ai.providers.chatgpt.key },
    deepseek: { name: ENV.ai.providers.deepseek.model, apiKey: ENV.ai.providers.deepseek.key },
    anthropic: { name: ENV.ai.providers.anthropic.model, apiKey: ENV.ai.providers.anthropic.key },
    meta: { name: ENV.ai.providers.meta.model, apiKey: ENV.ai.providers.meta.key },
  },

  routeModels: {
    intro: ["chatgpt", "google", "meta"],
    main: ["google", "chatgpt", "deepseek"],
    outro: ["google", "chatgpt", "meta"],

    scriptIntro: ["chatgpt", "google", "meta"],
    scriptMain: ["google", "chatgpt", "deepseek"],
    scriptOutro: ["google", "chatgpt", "meta"],

    compose: ["deepseek", "anthropic", "google"],

    // ==========================================
    // 🔥 REQUIRED NEW ROUTES (the missing piece)
    // ==========================================
    editorialPass: ["chatgpt"],
    editAndFormat: ["chatgpt", "google", "deepseek"],
    // ==========================================

    metadata: ["google", "chatgpt", "deepseek"],
    podcastHelper: ["chatgpt", "google", "meta"],
    seoKeywords: ["chatgpt", "google"],
    artworkPrompt: ["meta","google"],
    rssRewrite: ["chatgpt", "google", "meta"],
    rssShortTitle: ["chatgpt", "google", "meta"],
  },

  commonParams: { temperature: 0.85, timeout: 45000 },

  headers: {
    "HTTP-Referer": ENV.core.APP_URL || "http://localhost:3000",
    "X-Title": ENV.core.APP_TITLE || "Podcast Script Generation",
  },
};

export default aiConfig;
