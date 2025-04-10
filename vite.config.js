import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    server: {
        port: 8080
    },
    plugins: [
        nodePolyfills({
            globals: {
                Buffer: true
            }
        })
    ]
});