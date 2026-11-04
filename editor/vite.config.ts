import { defineConfig } from 'vite';
import path from 'node:path';
// Static build for GitHub Pages. SFX wavs are served from the site root (same files the renderer uses).
export default defineConfig({
  root: __dirname,
  base: process.env.PAGES_BASE ?? '/motion-presets-lab/',
  publicDir: path.resolve(__dirname, '../presets/sfx/out'),
  build: { outDir: path.resolve(__dirname, '../dist-editor'), emptyOutDir: true, chunkSizeWarningLimit: 4000 },
  esbuild: { jsx: 'automatic' },
});
