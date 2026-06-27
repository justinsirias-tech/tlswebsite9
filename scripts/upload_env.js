const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.join(__dirname, '../.env');

function uploadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('No .env file found at:', envPath);
    return;
  }

  // Replace all carriage returns to handle Windows CRLF line endings cleanly
  const envContent = fs.readFileSync(envPath, 'utf8').replace(/\r/g, '');
  const lines = envContent.split('\n');
  const envVars = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      
      // Strip outer quotes if present
      while ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1).trim();
      }
      
      envVars[key] = val;
    }
  }

  // Also add JWT_SECRET if not in .env
  if (!envVars['JWT_SECRET']) {
    envVars['JWT_SECRET'] = 'tls-secret-key-2026';
  }

  const keys = Object.keys(envVars);
  console.log(`Found ${keys.length} environment variables to configure.`);

  for (const key of keys) {
    const val = envVars[key];
    console.log(`Configuring ${key} on Vercel... Value length: ${val.length}`);
    
    // First, remove old key if it exists in any env
    spawnSync('npx', ['vercel', 'env', 'rm', key, 'production', '--yes'], { shell: true, stdio: 'inherit' });
    spawnSync('npx', ['vercel', 'env', 'rm', key, 'preview', '--yes'], { shell: true, stdio: 'inherit' });
    spawnSync('npx', ['vercel', 'env', 'rm', key, 'development', '--yes'], { shell: true, stdio: 'inherit' });

    // Add for each environment
    const envs = ['production', 'preview', 'development'];
    for (const env of envs) {
      const res = spawnSync('npx', ['vercel', 'env', 'add', key, env], {
        input: val,
        shell: true,
        encoding: 'utf8'
      });
      if (res.status !== 0) {
        console.error(`Error setting ${key} for ${env}:`, res.stderr);
      } else {
        console.log(`Successfully set ${key} for ${env}`);
      }
    }
  }
  console.log('Environment variables configuration completed!');
}

uploadEnv();
