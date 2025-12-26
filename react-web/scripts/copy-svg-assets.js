/**
 * Script to copy SVG assets from src to public directory
 * 
 * This script copies all SVG files from the src/assets directory to the public directory,
 * maintaining the same directory structure to ensure they're accessible via URL.
 */

const fs = require('fs');
const path = require('path');

// Define source and destination directories
const srcDir = path.join(__dirname, '../src/assets');
const publicDir = path.join(__dirname, '../public');

// Function to create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Function to copy a file
function copyFile(source, destination) {
  try {
    const content = fs.readFileSync(source);
    fs.writeFileSync(destination, content);
    console.log(`Copied: ${source} -> ${destination}`);
  } catch (error) {
    console.error(`Error copying ${source}: ${error.message}`);
  }
}

// Function to recursively copy SVG files
function copyAssets(sourceDir, destDir, relativePath = '') {
  const currentDir = path.join(sourceDir, relativePath);
  const items = fs.readdirSync(currentDir);
  
  for (const item of items) {
    const sourcePath = path.join(currentDir, item);
    const stat = fs.statSync(sourcePath);
    
    // If it's a directory, recursively copy its contents
    if (stat.isDirectory()) {
      const newRelativePath = path.join(relativePath, item);
      copyAssets(sourceDir, destDir, newRelativePath);
    } 
    // If it's an SVG file, copy it to the public directory
    else if (item.endsWith('.svg')) {
      const destPath = path.join(destDir, relativePath, item);
      const destDirPath = path.dirname(destPath);
      
      // Ensure the destination directory exists
      ensureDirectoryExists(destDirPath);
      
      // Copy the file
      copyFile(sourcePath, destPath);
    }
  }
}

// Create the main public directories
ensureDirectoryExists(publicDir);
ensureDirectoryExists(path.join(publicDir, 'assets'));
ensureDirectoryExists(path.join(publicDir, 'hive-icons'));
ensureDirectoryExists(path.join(publicDir, 'category-icons'));

// Copy all SVG files from src/assets to public
console.log('Starting to copy SVG assets...');
copyAssets(srcDir, publicDir);

// Also copy SVG files to root paths for direct references
const hiveIconsDir = path.join(srcDir, 'hive-icons');
if (fs.existsSync(hiveIconsDir)) {
  const hiveIcons = fs.readdirSync(hiveIconsDir).filter(file => file.endsWith('.svg'));
  for (const icon of hiveIcons) {
    copyFile(
      path.join(hiveIconsDir, icon),
      path.join(publicDir, 'hive-icons', icon)
    );
  }
}

const categoryIconsDir = path.join(srcDir, 'category-icons');
if (fs.existsSync(categoryIconsDir)) {
  const categoryIcons = fs.readdirSync(categoryIconsDir).filter(file => file.endsWith('.svg'));
  for (const icon of categoryIcons) {
    copyFile(
      path.join(categoryIconsDir, icon),
      path.join(publicDir, 'category-icons', icon)
    );
  }
}

// Copy root SVG files to public root
const rootSvgFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.svg'));
for (const file of rootSvgFiles) {
  copyFile(
    path.join(srcDir, file),
    path.join(publicDir, file)
  );
}

console.log('SVG assets copying completed!');
