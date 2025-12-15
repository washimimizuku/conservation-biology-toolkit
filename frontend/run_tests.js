#!/usr/bin/env node

/**
 * Frontend Test Runner for Conservation Biology Toolkit
 * 
 * This script provides different test execution modes:
 * - Unit tests only
 * - Integration tests only
 * - All tests with coverage
 * - Watch mode for development
 */

const { spawn } = require('child_process');
const path = require('path');

const testModes = {
  unit: {
    description: 'Run unit tests only',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=__tests__/(pages|config)', '--watchAll=false']
  },
  integration: {
    description: 'Run integration tests only',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=__tests__/integration', '--watchAll=false']
  },
  all: {
    description: 'Run all tests',
    command: 'npm',
    args: ['test', '--', '--watchAll=false']
  },
  coverage: {
    description: 'Run all tests with coverage report',
    command: 'npm',
    args: ['run', 'test:coverage']
  },
  watch: {
    description: 'Run tests in watch mode',
    command: 'npm',
    args: ['test']
  },
  ci: {
    description: 'Run tests for CI/CD',
    command: 'npm',
    args: ['run', 'test:ci']
  }
};

function showHelp() {
  console.log('Frontend Test Runner');
  console.log('Usage: node run_tests.js [mode]');
  console.log('');
  console.log('Available modes:');
  Object.entries(testModes).forEach(([mode, config]) => {
    console.log(`  ${mode.padEnd(12)} ${config.description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node run_tests.js unit       # Run only unit tests');
  console.log('  node run_tests.js coverage   # Run all tests with coverage');
  console.log('  node run_tests.js watch      # Run tests in watch mode');
}

function runTests(mode) {
  const config = testModes[mode];
  if (!config) {
    console.error(`Unknown test mode: ${mode}`);
    showHelp();
    process.exit(1);
  }

  console.log(`Running ${config.description}...`);
  console.log(`Command: ${config.command} ${config.args.join(' ')}`);
  console.log('');

  const child = spawn(config.command, config.args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: process.platform === 'win32'
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Tests completed successfully!');
    } else {
      console.log(`\n❌ Tests failed with exit code ${code}`);
    }
    process.exit(code);
  });

  child.on('error', (error) => {
    console.error('Failed to start test process:', error);
    process.exit(1);
  });
}

// Parse command line arguments
const mode = process.argv[2] || 'all';

if (mode === 'help' || mode === '--help' || mode === '-h') {
  showHelp();
  process.exit(0);
}

runTests(mode);