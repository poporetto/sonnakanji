// Tells search engines which pages changed, using the IndexNow protocol. Run after a deploy:
//   node scripts/indexnow.mjs           every page in the live sitemap
//   node scripts/indexnow.mjs /kanjimono/ /about/   just these paths
import { readdirSync } from 'node:fs';

const host = 'www.sonnakanji.com';
const key = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f)).replace('.txt', '');
const paths = process.argv.slice(2);
const urls = paths.length
  ? paths.map((p) => `https://${host}${p}`)
  : [...(await (await fetch(`https://${host}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} for ${urls.length} URLs`);
