import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  plugins: [
    javascriptObfuscator({
      // Obfuscate JS: enable string array encoding and rotation for "encryption-like" effect
      rotateStringArray: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      // Compact code
      compact: true,
      controlFlowFlattening: false, // Disable if it breaks functionality
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false, // Avoid breaking dev tools if needed
      debugProtectionInterval: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'mangled',
      renameGlobals: false,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    }),
    viteSingleFile({
      // Bundle into single HTML file
      removeConsole: false, // Keep console for debugging if needed
      removeDebugger: true,
      maxSizeInKb: 2048, // Adjust if bundle is too large
    }),
  ],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: false, // For single file
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        renderChunk: (code, chunk, options) => {
          // Ensure JS is processed for obfuscation
          return code;
        },
      },
    },
    target: 'esnext',
    sourcemap: false, // Disable sourcemaps for obfuscation
  },
});
