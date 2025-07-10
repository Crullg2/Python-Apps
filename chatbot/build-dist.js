#!/usr/bin/env node

/**
 * VA Healthcare AI Chatbot - Distribution Builder
 * Creates a clean package for deployment and distribution
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building VA Healthcare AI Chatbot Distribution Package...\n');

// Create distribution directory structure
const distDir = './dist';
const dirs = [
    './dist',
    './dist/core',
    './dist/demos',
    './dist/assets',
    './dist/docs',
    './dist/tests'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// File mapping for distribution
const filesToCopy = [
    // Core files
    { src: 'chatbot.js', dest: 'core/va-chatbot.js' },
    { src: 'training.js', dest: 'core/va-training.js' },
    { src: 'index.html', dest: 'core/index.html' },
    { src: 'training.html', dest: 'core/training.html' },
    
    // Demo files
    { src: 'live-demo.html', dest: 'demos/live-demo.html' },
    { src: 'integration-test.html', dest: 'demos/integration-test.html' },
    { src: 'context-demo.html', dest: 'demos/context-demo.html' },
    { src: 'quick-test.html', dest: 'demos/quick-test.html' },
    
    // Documentation
    { src: 'README.md', dest: 'docs/README.md' },
    { src: 'INTEGRATION_SUMMARY.md', dest: 'docs/INTEGRATION_SUMMARY.md' },
    { src: 'MISSION_COMPLETE.md', dest: 'docs/MISSION_COMPLETE.md' },
    { src: 'BUG_FIX_COMPLETE.md', dest: 'docs/BUG_FIX_COMPLETE.md' },
    
    // Tests
    { src: 'test/test-chatbot.js', dest: 'tests/test-chatbot.js' }
];

// Copy files to distribution
console.log('\n📂 Copying files to distribution...');
filesToCopy.forEach(({ src, dest }) => {
    const srcPath = path.join('.', src);
    const destPath = path.join(distDir, dest);
    
    if (fs.existsSync(srcPath)) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ ${src} → ${dest}`);
    } else {
        console.log(`⚠️  File not found: ${src}`);
    }
});

console.log('\n🎉 Distribution package created successfully!');
console.log(`📦 Package location: ${path.resolve(distDir)}`);
