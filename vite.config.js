import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import apiHandler from './api/index.js'
import url from 'url'

function apiDevServerPlugin() {
  return {
    name: 'shiftly-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url, true);
        if (parsedUrl.pathname === '/api' || parsedUrl.pathname.startsWith('/api/')) {
          req.query = parsedUrl.query;
          
          // Parse request body for POST/PUT requests
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            let bodyData = '';
            req.on('data', chunk => {
              bodyData += chunk;
            });
            req.on('end', async () => {
              try {
                req.body = bodyData ? JSON.parse(bodyData) : {};
              } catch (e) {
                req.body = {};
              }

              // Mock express response methods for Vercel handler compatibility
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              res.send = (data) => {
                res.end(data);
                return res;
              };

              try {
                await apiHandler(req, res);
              } catch (err) {
                console.error('[Vite API Error]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            req.body = {};
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            res.send = (data) => {
              res.end(data);
              return res;
            };

            try {
              await apiHandler(req, res);
            } catch (err) {
              console.error('[Vite API Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), apiDevServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
  },
})
