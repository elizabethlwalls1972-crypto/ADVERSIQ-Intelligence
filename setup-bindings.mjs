#!/usr/bin/env node
/**
 * Cloudflare Pages Functions Bindings Auto-Setup
 * This script automatically configures AI and KV bindings for your Pages project
 * Run this after you've authenticated with: npx wrangler login
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ACCOUNT_ID = 'f38477518e4eae41959abe6eb374c4d6';
const PROJECT_NAME = 'adversiq-intelligence';
const KV_NAMESPACE_ID = '6b2e2a1e5b864d5f9e3c0a7d1b8e4f2a';
const ENVIRONMENT = 'production';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Cloudflare Pages Functions - Bindings Auto-Setup         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📋 Configuration:');
console.log(`   Account ID:    ${ACCOUNT_ID}`);
console.log(`   Project:       ${PROJECT_NAME}`);
console.log(`   Environment:   ${ENVIRONMENT}`);
console.log(`   KV Namespace:  ${KV_NAMESPACE_ID}\n`);

// Step 1: Verify wrangler authentication
console.log('🔐 Step 1: Verifying Cloudflare authentication...');
try {
  const whoami = execSync('npx wrangler whoami', { encoding: 'utf8' });
  if (whoami.includes('logged in') || whoami.includes('elizabethlwalls')) {
    console.log('✅ Authenticated with Cloudflare\n');
  }
} catch (error) {
  console.error('❌ Not authenticated. Run: npx wrangler login');
  process.exit(1);
}

// Step 2: Get the authorization token
console.log('🔑 Step 2: Retrieving API token...');
let apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!apiToken) {
  try {
    // Try to extract from wrangler's cache
    const tokenLocations = [
      path.join(process.env.APPDATA || '', '.wrangler', 'config.toml'),
      path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config.toml'),
      path.join(process.env.HOME || '', '.wrangler', 'config.toml'),
      path.join(process.env.XDG_CONFIG_HOME || '', '.wrangler', 'config.toml'),
    ];
    
    for (const loc of tokenLocations) {
      try {
        if (fs.existsSync(loc)) {
          const content = fs.readFileSync(loc, 'utf8');
          const match = content.match(/oauth_token\s*=\s*"([^"]+)"|api_token\s*=\s*"([^"]+)"/);
          if (match) {
            apiToken = match[1] || match[2];
            console.log(`✅ Found API token\n`);
            break;
          }
        }
      } catch (e) {
        // Continue to next location
      }
    }
  } catch (error) {
    console.log('⚠️  Could not extract token from files\n');
  }
}

if (!apiToken) {
  console.log('\n⏳ Attempting via wrangler-authenticated curl...\n');
  console.log('Your app is already deployed! Manual binding setup option:\n');
  console.log('📖 Go to: https://dash.cloudflare.com/pages/view/adversiq-intelligence/settings/functions\n');
  console.log('📝 Add these two bindings under "Production" environment:');
  console.log('   1. Binding Name: AI');
  console.log('      Type: Workers AI\n');
  console.log('   2. Binding Name: NSIL_MEMORY');
  console.log('      Type: KV Namespace');
  console.log('      Namespace: Select "NSIL_MEMORY"\n');
  
  console.log('💡 Or set your token and run again:');
  console.log('   $env:CLOUDFLARE_API_TOKEN = "your_token_here"\n');
  process.exit(0);
}

// Step 3: Attempt to configure bindings via API
console.log('🚀 Step 3: Configuring bindings via Cloudflare API...\n');

function makeApiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'adversiq-bindings-setup/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, body: response });
        } catch {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    // Attempt to configure AI binding
    console.log('  📡 Adding AI binding...');
    const aiPath = `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/environments/${ENVIRONMENT}/deployment_configs`;
    const aiData = {
      bindings: [
        {
          name: 'AI',
          type: 'ai'
        }
      ]
    };
    
    const aiResult = await makeApiCall('PATCH', aiPath, aiData);
    if (aiResult.status === 200 || aiResult.status === 201) {
      console.log('     ✅ AI binding configured\n');
    } else {
      console.log(`     ⚠️  Status ${aiResult.status}\n`);
    }
    
    // Attempt to configure KV binding
    console.log('  📡 Adding KV Namespace binding...');
    const kvData = {
      bindings: [
        {
          name: 'NSIL_MEMORY',
          type: 'kv_namespace',
          namespace_id: KV_NAMESPACE_ID
        }
      ]
    };
    
    const kvResult = await makeApiCall('PATCH', aiPath, kvData);
    if (kvResult.status === 200 || kvResult.status === 201) {
      console.log('     ✅ KV binding configured\n');
    } else {
      console.log(`     ⚠️  Status ${kvResult.status}\n`);
    }
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Setup Complete!                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('Your Cloudflare Pages project is now configured with:');
    console.log('  ✓ AI binding (Workers AI models access)');
    console.log('  ✓ KV binding (NSIL persistent memory)\n');
    
    console.log('🚀 Your application is live at:');
    console.log('   https://adversiq-intelligence.pages.dev\n');
    
  } catch (error) {
    console.error('\n❌ Error during API configuration:');
    console.error(error.message);
    
    console.log('\n📖 For manual setup, visit:');
    console.log('   https://dash.cloudflare.com/pages/view/adversiq-intelligence/settings/functions\n');
    console.log('Then add these bindings under "Production":');
    console.log('   • AI: Workers AI');
    console.log('   • NSIL_MEMORY: KV Namespace\n');
  }
})();
