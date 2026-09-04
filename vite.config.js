import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/get-otp')) {
          try {
            const mod = await import('./api/get-otp.js');
            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) buffers.push(chunk);
              try { body = JSON.parse(Buffer.concat(buffers).toString()); } catch (e) {}
            }
            req.body = body;
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            req.query = Object.fromEntries(parsedUrl.searchParams.entries());
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            return mod.default(req, res);
          } catch (err) {
            console.error('Dev server API proxy error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    apiDevServerPlugin()
  ],
  build: {
    cssMinify: false,
    sourcemap: false
  }
})
