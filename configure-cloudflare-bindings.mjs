#!/usr/bin/env node
/**
 * ADVERSIQ Cloudflare Bindings Configuration Script
 * Automatically adds AI and KV namespace bindings to your Pages project
 */

import https from 'https';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  accountId: 'f38477518e4eae41959abe6eb374c4d6',
  projectName: 'adversiq-intelligence',
  environment: 'production',
  kvNamespaceId: '385338eaef31405da6ee1803f4077f8a',
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function getApiToken() {
  // Try to get token from environment first
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }

  // Try to read from wrangler config
  try {
    const configPath = path.join(
      process.env.APPDATA || process.env.HOME,
      'xdg.config',
      '.wrangler',
      'config',
      'default.toml'
    );
    
    const content = readFileSync(configPath, 'utf-8');
    const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
    
    if (match) {
      return match[1];
    }
  } catch (e) {
    // Token not in config file
  }

  return null;
}

async function makeApiCall(method, path, body = null, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ADVERSIQ-Bindings-Setup/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function configureBdndings(token) {
  const { accountId, projectName, environment, kvNamespaceId } = CONFIG;
  
  console.log('\n' + '═'.repeat(60));
  log(colors.cyan, '🚀', 'ADVERSIQ Cloudflare Bindings Configuration');
  console.log('═'.repeat(60) + '\n');

  log(colors.blue, 'ℹ️ ', `Account ID:    ${accountId}`);
  log(colors.blue, 'ℹ️ ', `Project:       ${projectName}`);
  log(colors.blue, 'ℹ️ ', `Environment:   ${environment}`);
  log(colors.blue, 'ℹ️ ', `KV Namespace:  ${kvNamespaceId}`);
  console.log();

  try {
    // Step 1: Add AI Binding
    log(colors.cyan, '📡', 'Step 1: Adding AI binding...');
    
    const aiBindingPath = `/accounts/${accountId}/pages/projects/${projectName}/environments/${environment}/deployment_configs`;
    const aiBindingPayload = {
      bindings: [
        {
          name: 'AI',
          type: 'ai'
        }
      ]
    };

    const aiResult = await makeApiCall('PATCH', aiBindingPath, aiBindingPayload, token);
    
    if (aiResult.status >= 200 && aiResult.status < 300) {
      log(colors.green, '✅', 'AI binding added successfully');
    } else if (aiResult.status === 400 && aiResult.body?.errors?.some(e => e.message?.includes('already'))) {
      log(colors.yellow, '⚠️ ', 'AI binding already exists (no change needed)');
    } else {
      throw new Error(`Failed to add AI binding: ${aiResult.status} - ${JSON.stringify(aiResult.body)}`);
    }

    // Step 2: Add KV Binding
    log(colors.cyan, '📡', 'Step 2: Adding KV namespace binding...');
    
    const kvBindingPayload = {
      bindings: [
        {
          name: 'NSIL_MEMORY',
          type: 'kv_namespace',
          namespace_id: kvNamespaceId
        }
      ]
    };

    const kvResult = await makeApiCall('PATCH', aiBindingPath, kvBindingPayload, token);
    
    if (kvResult.status >= 200 && kvResult.status < 300) {
      log(colors.green, '✅', 'KV namespace binding added successfully');
    } else if (kvResult.status === 400 && kvResult.body?.errors?.some(e => e.message?.includes('already'))) {
      log(colors.yellow, '⚠️ ', 'KV binding already exists (no change needed)');
    } else {
      throw new Error(`Failed to add KV binding: ${kvResult.status} - ${JSON.stringify(kvResult.body)}`);
    }

    console.log();
    console.log('═'.repeat(60));
    log(colors.green, '✨', 'BINDINGS CONFIGURED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log();

    log(colors.green, '✓', 'AI binding active (LLaMA models enabled)');
    log(colors.green, '✓', 'KV binding active (persistent memory enabled)');
    console.log();

    log(colors.blue, '🌐', 'Your app is live at:');
    log(colors.bright, '   ', `https://${projectName}.pages.dev`);
    console.log();

    log(colors.blue, '✅', 'Test the API:');
    log(colors.bright, '   ', `curl https://${projectName}.pages.dev/api/health`);
    console.log();

  } catch (error) {
    console.log();
    log(colors.red, '❌', 'Error during configuration:');
    log(colors.red, '   ', error.message);
    console.log();
    
    log(colors.yellow, '📖', 'Manual Configuration Required:');
    log(colors.bright, '   ', 'Go to: https://dash.cloudflare.com/pages/view/advers/settings/functions');
    log(colors.bright, '   ', '1. Click "Add Binding" for AI (Workers AI)');
    log(colors.bright, '   ', '2. Click "Add Binding" for NSIL_MEMORY (KV Namespace)');
    console.log();
    
    process.exit(1);
  }
}

// Main
(async () => {
  try {
    log(colors.yellow, '🔐', 'Getting Cloudflare API token...');
    const token = getApiToken();

    if (!token) {
      throw new Error('Could not find Cloudflare API token. Please set CLOUDFLARE_API_TOKEN environment variable or authenticate with: npx wrangler login');
    }

    log(colors.green, '✓', 'Token found');
    console.log();

    await configureBdndings(token);
  } catch (error) {
    log(colors.red, '❌', error.message);
    console.log();
    log(colors.yellow, '💡', 'To manually authenticate, run: npx wrangler login');
    process.exit(1);
  }
})();
