const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = ['node_modules', 'dist', 'dist-server', '.git'];
const TEXT_EXT = new Set(['.md','.markdown','.mdx','.ts','.tsx','.js','.jsx','.json','.html','.htm','.css','.yml','.yaml','.txt','.env','.scss','.sass','.xml']);

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

function shouldProcess(file){
  const ext = path.extname(file).toLowerCase();
  return TEXT_EXT.has(ext) || file.toLowerCase().includes('readme') || file.toLowerCase().endsWith('.txt');
}

(async ()=>{
  try{
    const files = await walk(ROOT);
    const targetRegex = /BW\s*NEXUS\s*AI/gi;
    let changed = 0;
    let touched = [];
    for(const f of files){
      if(!shouldProcess(f)) continue;
      let content = await fs.readFile(f, 'utf8');
      if(targetRegex.test(content)){
        const updated = content.replace(targetRegex, 'BWGA Intelligence AI');
        await fs.writeFile(f, updated, 'utf8');
        changed++;
        touched.push(f.replace(ROOT + path.sep, ''));
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
