import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src')
];

let replacedFiles = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let updated = content;
    
    // Replace custom tailwind classes with arbitrary values
    updated = updated.replace(/bg-primary/g, `bg-[#344D67]`);
    updated = updated.replace(/text-primary/g, `text-[#344D67]`);
    updated = updated.replace(/border-primary/g, `border-[#344D67]`);
    
    updated = updated.replace(/bg-accent/g, `bg-[#FF0000]`);
    updated = updated.replace(/text-accent/g, `text-[#FF0000]`);
    updated = updated.replace(/border-accent/g, `border-[#FF0000]`);

    if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        replacedFiles++;
        console.log(`Fixed ${file}`);
    }
  }
}
console.log(`Replaced colors in ${replacedFiles} files.`);
