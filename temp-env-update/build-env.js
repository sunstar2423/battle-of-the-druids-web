#!/usr/bin/env node
/**
 * Build script to replace environment variables in HTML files
 * This allows keeping sensitive data in environment variables while deploying static HTML
 */

const fs = require('fs');
const path = require('path');

// Environment variables to replace
const ENV_VARS = {
    'GOOGLE_ANALYTICS_ID': process.env.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXX',
    'SITE_URL': process.env.SITE_URL || 'https://titanbladegames.com',
    'CONTACT_EMAIL': process.env.CONTACT_EMAIL || 'contact@titanbladegames.com'
};

/**
 * Replace environment variable placeholders in a file
 * @param {string} filePath - Path to the file to process
 */
function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace environment variable placeholders
    for (const [envVar, value] of Object.entries(ENV_VARS)) {
        const placeholder = `{{${envVar}}}`;
        if (content.includes(placeholder)) {
            content = content.replace(new RegExp(placeholder, 'g'), value);
            modified = true;
            console.log(`  Replaced ${placeholder} with ${value}`);
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  Updated: ${filePath}`);
    } else {
        console.log(`  No placeholders found in ${filePath}`);
    }
}

/**
 * Find all HTML files in a directory recursively
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of HTML file paths
 */
function findHtmlFiles(dir) {
    const files = [];
    
    function searchDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Skip node_modules and other build directories
                if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                    searchDir(fullPath);
                }
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    searchDir(dir);
    return files;
}

/**
 * Main build function
 */
function main() {
    console.log('🔧 Building HTML files with environment variables...');
    console.log('Environment variables:');
    
    for (const [key, value] of Object.entries(ENV_VARS)) {
        console.log(`  ${key}: ${value}`);
    }
    
    console.log('\nProcessing HTML files...');
    
    // Find all HTML files
    const htmlFiles = findHtmlFiles('.');
    
    if (htmlFiles.length === 0) {
        console.log('No HTML files found.');
        return;
    }
    
    // Process each HTML file
    htmlFiles.forEach(processFile);
    
    console.log(`\n✅ Build complete! Processed ${htmlFiles.length} HTML files.`);
}

// Run the build
if (require.main === module) {
    main();
}

module.exports = { processFile, findHtmlFiles, ENV_VARS };