import { defineConfig } from 'vite';
import { resolve } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const pathRewritePlugin = () => ({
  name: 'tunan-path-rewrite',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      try {
        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname.replace(/\/+$/, '') || '/';

        const mapping = {
          '/products': 'page/product.html',
          '/team': 'page/team.html',
          '/social': 'page/social.html',
          '/team/intro': 'page/team.html',
          '/team/social': 'page/social.html'
        };

        const target = mapping[pathname];
        if (!target) {
          return next();
        }

        const filePath = resolve(__dirname, target);
        const html = await fs.readFile(filePath, 'utf-8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      } catch (err) {
        next();
      }
    });
  }
});

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [pathRewritePlugin()],
  server: {
    port: 3000,
    open: true,
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'page/product.html'),
        team: resolve(__dirname, 'page/team.html'),
        social: resolve(__dirname, 'page/social.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/script'
    }
  }
});