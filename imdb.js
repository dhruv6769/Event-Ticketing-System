const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', reject);
  });
};

const getImdbPoster = (id) => {
  return new Promise((resolve) => {
    https.get(`https://www.imdb.com/title/${id}/`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="(https:\/\/m\.media-amazon\.com\/images\/M\/[^"]+)"/);
        if (match && match[1]) resolve(match[1]);
        else resolve(null);
      });
    });
  });
};

async function run() {
  const movies = [
    { id: 'tt12735488', name: 'kalki' },
    { id: 'tt15312334', name: 'pushpa' },
    { id: 'tt15239678', name: 'dune' }
  ];
  for (let m of movies) {
    const url = await getImdbPoster(m.id);
    if (url) {
      console.log(`Found ${m.name}: ${url}`);
      await download(url, path.join(__dirname, 'frontend/public', `${m.name}_new.jpg`));
      console.log(`Downloaded ${m.name}`);
    } else {
      console.log(`Failed to find ${m.name}`);
    }
  }
}
run();
