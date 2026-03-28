import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false, // changed from inline to true
    rollupOptions: {
      output: {
        sourcemap: false // added to generate separate .map files
      }
    }
  }
});
