import { ENV } from "../../../scripts/envBootstrap.js";
export const aiConfig = {
  models: {
    google: { name: ENV.OPENROUTER_GOOGLE, apiKey: ENV.OPENROUTER_API_KEY_GOOGLE },
    chatgpt: { name: ENV.OPENROUTER_CHATGPT, apiKey: ENV.OPENROUTER_API_KEY_CHATGPT },
    deepseek: { name: ENV.OPENROUTER_DEEPSEEK, apiKey: ENV.OPENROUTER_API_KEY_DEEPSEEK },
    anthropic: { name: ENV.OPENROUTER_ANTHROPIC, apiKey: ENV.OPENROUTER_API_KEY_ANTHROPIC },
    meta: { name: ENV.OPENROUTER_META, apiKey: ENV.OPENROUTER_API_KEY_META },
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
    "HTTP-Referer": ENV.APP_URL || "http://localhost:3000",
    "X-Title": ENV.APP_TITLE || "Podcast Script Generation",
  },
};

export default aiConfig;
