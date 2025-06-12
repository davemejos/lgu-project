#!/usr/bin/env node

/**
 * Tailwind CSS Fix Script
 * 
 * This script helps diagnose and fix common Tailwind CSS issues
 * that cause styling disconnection problems.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Tailwind CSS Fix Script Starting...\n');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logStep = (step, message) => {
  log(`${step}. ${message}`, 'cyan');
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

// Step 1: Check if we're in the right directory
logStep(1, 'Checking project structure...');

const requiredFiles = [
  'package.json',
  'tailwind.config.js',
  'postcss.config.mjs',
  'src/app/globals.css'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    logSuccess(`Found ${file}`);
  } else {
    logError(`Missing ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  logError('Not all required files found. Make sure you\'re in the project root directory.');
  process.exit(1);
}

// Step 2: Clear Next.js cache
logStep(2, 'Clearing Next.js cache...');

try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    logSuccess('Cleared .next directory');
  } else {
    log('No .next directory found (already clean)', 'yellow');
  }
} catch (error) {
  logWarning(`Could not clear .next directory: ${error.message}`);
}

// Step 3: Clear node_modules/.cache if it exists
logStep(3, 'Clearing build caches...');

try {
  const cachePaths = [
    'node_modules/.cache',
    '.next/cache',
    'tsconfig.tsbuildinfo'
  ];
  
  for (const cachePath of cachePaths) {
    if (fs.existsSync(cachePath)) {
      fs.rmSync(cachePath, { recursive: true, force: true });
      logSuccess(`Cleared ${cachePath}`);
    }
  }
} catch (error) {
  logWarning(`Could not clear some cache directories: ${error.message}`);
}

// Step 4: Verify Tailwind configuration
logStep(4, 'Verifying Tailwind configuration...');

try {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  
  // Check for content paths
  if (tailwindConfig.includes('./src/')) {
    logSuccess('Content paths include src directory');
  } else {
    logWarning('Content paths might not include all necessary directories');
  }
  
  // Check for safelist
  if (tailwindConfig.includes('safelist')) {
    logSuccess('Safelist configuration found');
  } else {
    logWarning('No safelist found - dynamic classes might be purged');
  }
  
} catch (error) {
  logError(`Could not read tailwind.config.js: ${error.message}`);
}

// Step 5: Verify PostCSS configuration
logStep(5, 'Verifying PostCSS configuration...');

try {
  const postcssConfig = fs.readFileSync('postcss.config.mjs', 'utf8');
  
  if (postcssConfig.includes('tailwindcss') && postcssConfig.includes('autoprefixer')) {
    logSuccess('PostCSS configuration looks correct');
  } else {
    logWarning('PostCSS configuration might be incomplete');
  }
} catch (error) {
  logError(`Could not read postcss.config.mjs: ${error.message}`);
}

// Step 6: Verify globals.css
logStep(6, 'Verifying globals.css...');

try {
  const globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');
  
  const requiredDirectives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  let allDirectivesFound = true;
  
  for (const directive of requiredDirectives) {
    if (globalsCss.includes(directive)) {
      logSuccess(`Found ${directive}`);
    } else {
      logError(`Missing ${directive}`);
      allDirectivesFound = false;
    }
  }
  
  if (allDirectivesFound) {
    logSuccess('All Tailwind directives found in globals.css');
  }
} catch (error) {
  logError(`Could not read src/app/globals.css: ${error.message}`);
}

// Step 7: Check package.json dependencies
logStep(7, 'Checking dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['tailwindcss', 'postcss', 'autoprefixer'];
  
  for (const dep of requiredDeps) {
    if (deps[dep]) {
      logSuccess(`${dep}: ${deps[dep]}`);
    } else {
      logError(`Missing dependency: ${dep}`);
    }
  }
} catch (error) {
  logError(`Could not read package.json: ${error.message}`);
}

// Step 8: Reinstall dependencies
logStep(8, 'Reinstalling dependencies...');

try {
  log('Running npm install...', 'blue');
  execSync('npm install', { stdio: 'inherit' });
  logSuccess('Dependencies reinstalled');
} catch (error) {
  logError(`Failed to reinstall dependencies: ${error.message}`);
}

// Step 9: Test build
logStep(9, 'Testing build process...');

try {
  log('Running build test...', 'blue');
  execSync('npm run build', { stdio: 'pipe' });
  logSuccess('Build completed successfully');
} catch (error) {
  logWarning('Build failed - there might be TypeScript or other errors');
  log('Build error output:', 'yellow');
  console.log(error.stdout?.toString() || error.message);
}

// Step 10: Provide recommendations
logStep(10, 'Recommendations...');

log('\n📋 To prevent future Tailwind CSS disconnection issues:', 'bold');
log('');
log('1. Always use the tailwind-optimizer utility for dynamic classes', 'cyan');
log('2. Add frequently used dynamic classes to the safelist in tailwind.config.js', 'cyan');
log('3. Clear .next cache when experiencing styling issues', 'cyan');
log('4. Restart the development server after configuration changes', 'cyan');
log('5. Use the tailwind-health-check utility to monitor CSS health', 'cyan');
log('');

log('🚀 Tailwind CSS fix script completed!', 'green');
log('');
log('Next steps:', 'bold');
log('1. Run: npm run dev', 'cyan');
log('2. Check if styling issues are resolved', 'cyan');
log('3. If issues persist, check the browser console for errors', 'cyan');
log('');

// Create a quick test file
const testContent = `
// Quick Tailwind Test
// Add this to any component to test if Tailwind is working:

<div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-2">Tailwind Test</h1>
  <p className="text-blue-100">If you can see this styled correctly, Tailwind is working!</p>
</div>
`;

fs.writeFileSync('tailwind-test.txt', testContent);
logSuccess('Created tailwind-test.txt with test component');

log('\n🎉 All done! Your Tailwind CSS should now be working properly.', 'green');
