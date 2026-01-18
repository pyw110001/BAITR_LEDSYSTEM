/**
 * TuioBridge Launcher (CommonJS)
 * This file serves as the entry point for pkg to avoid ESM loading issues.
 */

const { pathToFileURL } = require('url');
const path = require('path');

// Use dynamic import with pathToFileURL to load the ESM main logic
// This is more robust in some environments than a plain relative path
import(pathToFileURL(path.join(__dirname, 'start.js')).href).catch(err => {
    console.error('Failed to load main module:', err);
    process.exit(1);
});
