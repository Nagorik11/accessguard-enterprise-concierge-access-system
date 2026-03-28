import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false, // changed from inline to true
    rollupOptions: {
      output: {
        sourcemap: true // added to generate separate .map files
      }
    }
  }
});
