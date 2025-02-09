import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig(({ command }) => {
  const isDevMode = command === "serve";

  // 共通の設定
  const commonConfig = {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/index.scss";`,
        },
      },
    },
  };

  if (isDevMode) {
    // 開発モード用の設定
    return {
      ...commonConfig,
      plugins: [vue()],
      server: {
        port: 8282,
        open: true,
        host: true,
      },
      optimizeDeps: {
        include: [
          "@tiptap/core",
          "@tiptap/starter-kit",
          "@tiptap/vue-3",
          "prosemirror-commands",
          "prosemirror-model",
          "prosemirror-schema-basic",
          "prosemirror-state",
          "prosemirror-view",
        ],
      },
    };
  }

  // ビルドモード用の設定
  return {
    ...commonConfig,
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "Vue3TiptapEditor",
        fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        external: [
          "vue",
          "@tiptap/core",
          "@tiptap/starter-kit",
          "@tiptap/vue-3",
          "prosemirror-commands",
          "prosemirror-model",
          "prosemirror-schema-basic",
          "prosemirror-state",
          "prosemirror-view",
        ],
        output: {
          globals: {
            vue: "Vue",
            "@tiptap/core": "TiptapCore",
            "@tiptap/vue-3": "TiptapVue",
            "@tiptap/starter-kit": "StarterKit",
          },
        },
      },
      cssCodeSplit: false,
      minify: true,
      sourcemap: true,
    },
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        include: ["src/**/*.ts", "src/**/*.vue"],
        exclude: ["src/dev/**/*"],
      }),
    ],
  };
});
