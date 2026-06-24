import fs from 'fs';
import path from 'path';

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const res = path.join(dir, file);
    if (fs.statSync(res).isDirectory()) {
      walk(res, files);
    } else {
      if (res.endsWith('page.js') || res.endsWith('route.js')) {
        files.push(res);
      }
    }
  }
  return files;
}

const files = walk('./src/app');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('prisma') || content.includes('NextResponse')) {
    if (!content.includes('force-dynamic')) {
      // Find the last import statement
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      const insertText = '\nexport const dynamic = "force-dynamic";\n';
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, insertText);
        content = lines.join('\n');
      } else {
        content = insertText + content;
      }
      
      fs.writeFileSync(file, content, 'utf-8');
      console.log('Fixed', file);
    }
  }
}
