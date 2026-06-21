const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = ['node_modules', 'dist', 'dist-server', '.git'];
const BINARY_EXT = new Set(['.png','.jpg','.jpeg','.gif','.bmp','.zip','.gz','.tar','.7z','.ico','.woff','.woff2','.eot','.ttf','.otf','.mp4','.mp3','.mov','.pdf']);

async function walk(dir){
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let results = [];
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(EXCLUDE.some(ex => full.includes(path.sep + ex + path.sep) || full.endsWith(path.sep + ex))) continue;
    if(e.isDirectory()){
      results = results.concat(await walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

(async ()=>{
  try{
    const files = await walk(ROOT);
    const targetRegex = /BW\s*NEXUS\s*AI/gi;
    let changed = 0;
    let touched = [];
    for(const f of files){
      const ext = path.extname(f).toLowerCase();
      if(BINARY_EXT.has(ext)) continue;
      try{
        let content = await fs.readFile(f, 'utf8');
        if(targetRegex.test(content)){
          const updated = content.replace(targetRegex, 'BWGA Intelligence AI');
          await fs.writeFile(f, updated, 'utf8');
          changed++;
          touched.push(f.replace(ROOT + path.sep, ''));
        }
      }catch(e){
        // skip files that can't be read as text
      }
    }
    console.log(`Replaced occurrences in ${changed} files.`);
    touched.forEach(t => console.log(t));
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(2);
  }
})();
