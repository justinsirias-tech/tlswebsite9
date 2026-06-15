const fs = require('fs');
const path = require('path');

function fix(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fix(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      content = content.replace(/from '\.\.\/\.\.\/lib\/prisma'/g, "from '../../../lib/prisma'");
      content = content.replace(/from "\.\.\/\.\.\/lib\/prisma"/g, 'from "../../../lib/prisma"');
      content = content.replace(/from "\.\.\/components\//g, 'from "../../components/');
      content = content.replace(/from '\.\.\/components\//g, "from '../../components/");
      
      // Also fix [id] or [slug] paths which need another level:
      // wait, if we are in [locale]/articles/[id]/page.js, the path to lib/prisma is `../../../../lib/prisma`
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fix('src/app/[locale]');
