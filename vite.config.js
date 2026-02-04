import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  },
  build: {
    outDir: "dist",
    // ================================
    // 🔒 보안: Source Map 비활성화
    // ================================
    sourcemap: false, // ✅ Production에서 Source Map 제거 (중요!)
    minify: "terser", // ✅ 코드 난독화

    // ================================
    // ⚡ 성능 최적화
    // ================================
    cssCodeSplit: true, // CSS 파일 분리
    assetsInlineLimit: 4096, // 작은 파일은 inline

    rollupOptions: {
      output: {
        // 📌 청크(라이브러리) 분리로 캐시 효율 증대
        manualChunks: {
          vendor: ["vue", "pinia"], // Vue 라이브러리 분리
        },

        // 📌 파일명에 hash 추가 (캐시 무효화)
        // 예: app-a1b2c3d4.js
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
