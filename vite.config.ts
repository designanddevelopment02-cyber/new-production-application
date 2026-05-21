import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { spawn, ChildProcess } from 'child_process';

let bgServer: ChildProcess | null = null;

export default defineConfig(({ command }) => {
  if (command === 'serve' && process.env.VITE_PARENT !== 'true') {
    console.log('[ViteConfig] Spawning backend Express server on port 3005...');
    
    // Start server.ts as a child process using tsx
    bgServer = spawn('npx', ['tsx', 'server.ts'], {
      env: {
        ...process.env,
        PORT: '3005',
        VITE_PARENT: 'true',
      },
      stdio: 'inherit',
      shell: true, // Use shell to resolve npx seamlessly in container environment
    });

    // Handle lifecycle cleanup so we do not leave zombie processes
    process.on('exit', () => {
      if (bgServer) bgServer.kill();
    });
    process.on('SIGINT', () => {
      if (bgServer) bgServer.kill();
      process.exit();
    });
    process.on('SIGTERM', () => {
      if (bgServer) bgServer.kill();
      process.exit();
    });
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3005',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
