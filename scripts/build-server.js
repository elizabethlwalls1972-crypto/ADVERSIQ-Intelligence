/**
 * Server Build Script for BWGA Intelligence AI
 * 
 * Uses esbuild to bundle the server for production deployment.
 * This avoids TypeScript configuration issues with ESM modules.
 */

/* eslint-disable no-undef */
import * as esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

async function build() {
  console.log('🔨 Building server for production...');
  console.log(`📍 Working directory: ${process.cwd()}`);
  
  // Ensure output directory exists
  const outDir = 'dist-server';
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  try {
    console.log('⚙️  Starting esbuild...');
    console.log('📄 Entry point: server/index.ts');
    
    await esbuild.build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist-server/server',
      // Keep all node_modules external so CommonJS packages (multer, mime-types,
      // type-is, compression, pdf-parse, etc.) are loaded at runtime from
      // node_modules rather than bundled — this prevents "Dynamic require of
      // 'path' is not supported" and similar ESM/CJS interop errors.
      packages: 'external',
      external: [
        // Node built-ins (node: protocol and bare specifiers)
        'node:fs', 'node:path', 'node:url', 'node:http', 'node:https',
        'node:crypto', 'node:stream', 'node:zlib', 'node:util', 'node:os',
        'node:events', 'node:buffer', 'node:querystring', 'node:child_process',
        'node:cluster', 'node:dgram', 'node:dns', 'node:net', 'node:readline',
        'node:tls', 'node:tty', 'node:v8', 'node:vm', 'node:worker_threads',
        'node:fs/promises', 'node:module',
        'fs', 'path', 'url', 'http', 'https', 'crypto', 'stream',
        'zlib', 'util', 'os', 'events', 'buffer', 'querystring',
        'child_process', 'cluster', 'dgram', 'dns', 'net', 'readline',
        'tls', 'tty', 'v8', 'vm', 'worker_threads', 'fs/promises', 'module',
      ],
      sourcemap: true,
      minify: false, // Keep readable for debugging
      logLevel: 'info',
    });

    console.log('✅ Server build complete!');
    console.log('📦 Output: dist-server/server/index.js');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ BUILD FAILED ❌');
    console.error('\nError Details:');
    if (error.message) console.error('Message:', error.message);
    if (error.errors) console.error('Errors:', error.errors);
    if (error.warnings) console.error('Warnings:', error.warnings);
    console.error('\nFull Error:', error);
    process.exit(1);
  }
}

build();
