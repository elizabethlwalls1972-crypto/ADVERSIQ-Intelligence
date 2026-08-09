import { writeFile } from 'fs/promises';

async function check() {
  const results = {};
  try {
    const r1 = await fetch('http://localhost:3002/api/health');
    results.health = { status: r1.status, body: await r1.text() };
  } catch (e) {
    results.health = { error: String(e) };
  }

  try {
    const r2 = await fetch('http://localhost:3001/');
    const text = await r2.text();
    results.frontend = { status: r2.status, snippet: text.slice(0,1000) };
  } catch (e) {
    results.frontend = { error: String(e) };
  }

  await writeFile('e2e-check.json', JSON.stringify(results, null, 2));
  console.log('Wrote e2e-check.json');
}

check().catch(err => {
  console.error('Error running e2e check', err);
  process.exit(1);
});
