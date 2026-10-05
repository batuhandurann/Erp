import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter';
import { securityHeaders, errorHandler } from './src/server/middleware/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemo = process.env.DEMO_MODE === 'true';

  // Strict Production Rules (Zero silent fallbacks)
  if (isProduction && !process.env.DATABASE_URL) {
    console.error('❌ FATAL STARTUP FAILURE: DATABASE_URL is missing in production environment.');
    console.error('BusinessFlow ERP requires a valid PostgreSQL database connection in production.');
    process.exit(1);
  }

  if (isProduction && isDemo) {
    console.error('❌ FATAL STARTUP FAILURE: DEMO_MODE=true is strictly forbidden when NODE_ENV=production.');
    process.exit(1);
  }

  // Security Headers
  app.use(securityHeaders);

  // Body Parser with strict payload limits (1MB max to prevent memory exhaustion DOS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Mount API Router on /api/v1
  app.use('/api/v1', apiRouter);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`BusinessFlow ERP Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
