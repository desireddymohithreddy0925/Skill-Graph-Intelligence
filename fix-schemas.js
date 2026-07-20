const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'backend', 'models');
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
  if (file === 'User.js' || file === 'Complaint.js') return; // We already hand-crafted these to have more specific limits
  
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace `type: String` with `type: String, maxLength: 5000`
  // But only if it doesn't already have maxLength
  let newContent = content.replace(/type:\s*String(?![\s,]+maxLength)/g, "type: String, maxLength: 5000");
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
