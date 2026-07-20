const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const frontendSrc = path.join(__dirname, 'frontend', 'src');

walkDir(frontendSrc, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace basic header
    content = content.replace(/headers:\s*{\s*'Authorization':\s*`Bearer \${localStorage\.getItem\('token'\)}`\s*}/g, "credentials: 'include'");
    
    // Replace header with Content-Type
    content = content.replace(/headers:\s*{\s*'Content-Type':\s*'application\/json',\s*'Authorization':\s*`Bearer \${localStorage\.getItem\('token'\)}`\s*}/g, "headers: { 'Content-Type': 'application/json' }, credentials: 'include'");

    // Replace header with Content-Type and other stuff
    content = content.replace(/'Authorization':\s*`Bearer \${localStorage\.getItem\('token'\)}`/g, "");

    // Socket.io auth
    content = content.replace(/auth:\s*{\s*token:\s*localStorage\.getItem\('token'\)\s*}/g, "withCredentials: true");

    // Clean up empty headers that might have been left
    content = content.replace(/headers:\s*{\s*,\s*}/g, "");
    content = content.replace(/headers:\s*{\s*}/g, "");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
