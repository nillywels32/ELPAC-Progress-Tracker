/**
 * Setup Verification Script
 * Run this after npm install to verify everything is set up correctly
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFYING PROJECT SETUP...\n');

let errors = 0;
let warnings = 0;

// Check for required files
const requiredFiles = [
  'package.json',
  'index.html',
  'vite.config.js',
  'src/main.jsx',
  'RoadToReclassificationEnhanced.jsx',
  'utils/calculations.js',
  'utils/localStorage.js',
  'utils/pdfGenerator.js',
  'components/charts/ComparisonBarChart.jsx',
  'components/charts/RadialProgressGauge.jsx',
  'components/charts/ElpacBreakdownChart.jsx',
  'components/charts/AchievementRadarChart.jsx',
  'components/animations/AnimatedCard.jsx',
  'components/animations/AnimatedProgress.jsx',
  'components/animations/CelebrationEffect.jsx',
  'components/PDFExport/ExportButtons.jsx'
];

console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ MISSING: ${file}`);
    errors++;
  }
});

// Check for node_modules
console.log('\n📦 Checking dependencies...\n');

if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules exists');

  // Check for specific packages
  const requiredPackages = [
    'react',
    'react-dom',
    'recharts',
    'framer-motion',
    'jspdf',
    'html2canvas',
    'react-confetti',
    'lucide-react',
    'vite'
  ];

  requiredPackages.forEach(pkg => {
    const pkgPath = path.join('node_modules', pkg);
    if (fs.existsSync(pkgPath)) {
      console.log(`  ✅ ${pkg} installed`);
    } else {
      console.log(`  ❌ MISSING: ${pkg}`);
      errors++;
    }
  });
} else {
  console.log('  ❌ node_modules not found');
  console.log('  ⚠️  Run: npm install');
  errors++;
}

// Check package.json
console.log('\n📋 Checking package.json...\n');

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  if (pkg.dependencies) {
    console.log('  ✅ Dependencies defined');
  } else {
    console.log('  ❌ No dependencies found');
    errors++;
  }

  if (pkg.scripts && pkg.scripts.dev) {
    console.log('  ✅ Dev script configured');
  } else {
    console.log('  ⚠️  No dev script found');
    warnings++;
  }

  if (pkg.scripts && pkg.scripts.build) {
    console.log('  ✅ Build script configured');
  } else {
    console.log('  ⚠️  No build script found');
    warnings++;
  }
} catch (error) {
  console.log('  ❌ Error reading package.json');
  errors++;
}

// Check for documentation
console.log('\n📚 Checking documentation...\n');

const docFiles = ['README.md', 'QUICKSTART.md', 'PROJECT_SUMMARY.md'];
docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  Missing: ${file}`);
    warnings++;
  }
});

// Check test file
console.log('\n🧪 Checking tests...\n');

if (fs.existsSync('tests/calculations.test.js')) {
  console.log('  ✅ Calculation tests found');
  console.log('  💡 Run: node tests/calculations.test.js');
} else {
  console.log('  ⚠️  Test file not found');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(50) + '\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n🚀 Your project is ready to run!');
  console.log('\nNext steps:');
  console.log('  1. npm run dev       - Start development server');
  console.log('  2. Open http://localhost:3000');
  console.log('  3. Start entering assessment scores!\n');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} ERROR(S) FOUND`);
    console.log('\n⚠️  Please fix errors before running the app.\n');
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} WARNING(S)`);
    console.log('   (Warnings are non-critical but should be reviewed)\n');
  }
}

// Exit with appropriate code
process.exit(errors > 0 ? 1 : 0);
