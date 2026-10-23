// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: { '/api/contact': 'http://127.0.0.1:4322' },
    },
    preview: {
      proxy: { '/api/contact': 'http://127.0.0.1:4322' },
    },
  },
});
