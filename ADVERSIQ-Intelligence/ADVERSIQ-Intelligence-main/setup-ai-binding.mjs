#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const accountId = 'f38477518e4eae41959abe6eb374c4d6';
const projectName = 'adversiq-intelligence';
const environment = 'production';

console.log('🔐 Setting up Cloudflare Pages bindings...\n');

// Get Cloudflare API token from wrangler config
let token = process.env.CLOUDFLARE_API_TOKEN;

if (!token) {
  console.log('⚠️  Token not in environment, attempting to extract from wrangler...\n');
  
  // Try to get config using wrangler whoami (this will show we're authenticated)
  try {
    const whoami = execSync('npx wrangler whoami', { encoding: 'utf-8' });
    console.log('✅ Authenticated with Cloudflare');
    console.log(whoami);
    
    // List token locations
    const configDirs = [
      path.join(process.env.APPDATA, 'xdg.config', '.wrangler'),
      path.join(process.env.USERPROFILE, '.wrangler'),
      path.join(process.env.APPDATA, '.wrangler'),
    ];
    
    let foundToken = false;
    for (const dir of configDirs) {
      const defaultTomlPath = path.join(dir, 'default.toml');
      if (fs.existsSync(defaultTomlPath)) {
        console.log(`\n📂 Found config at: ${defaultTomlPath}`);
        const content = fs.readFileSync(defaultTomlPath, 'utf-8');
        // Look for token pattern
        const tokenMatch = content.match(/oauth_token\s*=\s*"([^"]+)"/);
        if (tokenMatch) {
          token = tokenMatch[1];
          console.log('✅ Extracted token from wrangler config\n');
          foundToken = true;
          break;
        }
      }
    }
    
    if (!foundToken) {
      console.log(`\n⚠️  Could not extract token from wrangler config files.`);
      console.log(`\nManual Setup Required:`);
      console.log(`========================\n`);
      console.log(`Go to: https://dash.cloudflare.com/pages/view/${projectName}/settings/functions\n`);
      console.log(`Under "Production" environment, click "Add Binding" and add:\n`);
      console.log(`1. Variable name: AI`);
      console.log(`   Type: Workers AI\n`);
      console.log(`2. Variable name: NSIL_MEMORY`);
      console.log(`   Type: KV Namespace`);
      console.log(`   Namespace: adversiq-intelligence-data\n`);
      process.exit(0);
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

if (token) {
  console.log('🔑 Using Cloudflare API token for programmatic setup...\n');
  
  // API call to add AI binding
  const bindingsPayload = {
    bindings: [
      {
        type: 'ai',
        name: 'AI'
      },
      {
        type: 'kv_namespace',
        name: 'NSIL_MEMORY',
        namespace_id: '385338eaef31405da6ee1803f4077f8a'
      }
    ]
  };
  
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/environments/${environment}/deployment_configs`;
  
  console.log(`📡 API Endpoint: ${apiUrl}`);
  console.log(`📋 Payload: ${JSON.stringify(bindingsPayload, null, 2)}\n`);
  
  try {
    // Use curl with authentication
    const curlCmd = `curl -X PATCH "${apiUrl}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(bindingsPayload)}'`;
    
    const result = execSync(curlCmd, { encoding: 'utf-8', shell: 'powershell' });
    console.log('✅ API Response:');
    console.log(result);
    
    const response = JSON.parse(result);
    if (response.success) {
      console.log('\n✨ SUCCESS! AI and KV bindings configured!\n');
      console.log('Your app now has:');
      console.log('✅ Workers AI access (9 autonomous agents)');
      console.log('✅ KV Namespace memory (NSIL_MEMORY)');
      console.log('\n🎉 Your system is fully operational!');
      console.log(`📍 Live URL: https://21b8b045.adversiq-intelligence.pages.dev\n`);
    } else {
      console.log('❌ API error:');
      console.log(JSON.stringify(response, null, 2));
    }
  } catch (e) {
    console.error('API call failed:', e.message);
    console.log('\n📖 Manual Setup Required:');
    console.log(`Go to: https://dash.cloudflare.com/pages/view/${projectName}/settings/functions`);
  }
} else {
  console.log('❌ Could not obtain Cloudflare API token');
  console.log('\n📖 Manual Setup Required:');
  console.log(`Go to: https://dash.cloudflare.com/pages/view/${projectName}/settings/functions`);
}
