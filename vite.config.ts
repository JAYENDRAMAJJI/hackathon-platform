import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.BACKEND_URL || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                const isSSE = req.headers?.accept?.includes('text/event-stream') || req.url?.includes('/events');
                if (isSSE) {
                  res.writeHead(503, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                  });
                  res.end();
                } else {
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: false,
                    error: 'Backend service unreachable on port 3000. Please start the backend server.',
                    code: (err as any)?.code || 'ECONNREFUSED'
                  }));
                }
              }
            });
          },
        },
        '/events': {
          target: process.env.BACKEND_URL || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'text/event-stream' });
                res.end();
              }
            });
          },
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
