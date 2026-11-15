import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel 에서는 도메인 루트(/), GitHub Pages 프로젝트 사이트에서는 저장소 이름 하위
// 경로(/sing-pick/)로 서비스된다. Vercel 은 빌드 과정에서 VERCEL 환경변수를 넣어 준다.
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  base: process.env.VERCEL ? '/' : '/sing-pick/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
