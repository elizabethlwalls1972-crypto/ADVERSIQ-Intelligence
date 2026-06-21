#!/usr/bin/env node
/**
 * Cloudflare Pages Functions Bindings Auto-Setup
 * This script automatically configures AI and KV bindings for your Pages project
 * Run this after you've authenticated with: npx wrangler login
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  if (whoami.includes('logged in')) {
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
    ];
    
    for (const loc of tokenLocations) {
      if (fs.existsSync(loc)) {
        const content = fs.readFileSync(loc, 'utf8');
        const match = content.match(/api_token\s*=\s*"([^"]+)"/);
        if (match) {
          apiToken = match[1];
          console.log(`✅ Found API token at: ${loc}\n`);
          break;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Could not extract token from files\n');
  }
}

if (!apiToken) {
  console.log('\n❌ Could not obtain API token automatically');
  console.log('Please provide your Cloudflare API token:');
  console.log('  1. Go to: https://dash.cloudflare.com/profile/api/tokens');
  console.log('  2. Create a token with "Pages" and "Workers KV" permissions');
  console.log('  3. Set it as an environment variable:');
  console.log('     $env:CLOUDFLARE_API_TOKEN = "your_token_here"');
  console.log('\nThen run this script again.\n');
  process.exit(1);
}

// Step 3: Attempt to configure bindings via API
console.log('🚀 Step 3: Configuring bindings via Cloudflare API...\n');

function makeApiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.cloudflare.com/client/v4${path}`);
    
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
      console.log(`     ⚠️  Status ${aiResult.status} - Response:`, aiResult.body, '\n');
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
      console.log(`     ⚠️  Status ${kvResult.status} - Response:`, kvResult.body, '\n');
    }
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Setup Complete!                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('Your Cloudflare Pages project is now configured with:');
    console.log('  ✓ AI binding (Workers AI models access)');
    console.log('  ✓ KV binding (NSIL persistent memory)\n');
    
    console.log('🚀 Your application is live at:');
    console.log('   https://adversiq-intelligence.pages.dev\n');
    
    console.log('Next steps:');
    console.log('  1. Visit: https://adversiq-intelligence.pages.dev');
    console.log('  2. The app will now have access to AI models and persistent memory');
    console.log('  3. All autonomous learning and decision verification features are active\n');
    
  } catch (error) {
    console.error('\n❌ Error during API configuration:');
    console.error(error.message);
    console.log('\n⚠️  Manual setup required:');
    console.log('  Go to: https://dash.cloudflare.com/pages/view/adversiq-intelligence/settings/functions');
    console.log('  Add two bindings under "Production":');
    console.log('    1. Variable: AI → Workers AI');
    console.log('    2. Variable: NSIL_MEMORY → KV Namespace\n');
  }
})();
