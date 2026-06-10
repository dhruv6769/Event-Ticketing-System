const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if(res.statusCode===301||res.statusCode===302) return download(res.headers.location, dest).then(resolve).catch(reject);
      if(res.statusCode !== 200) return reject('Status ' + res.statusCode);
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => resolve(dest));
    }).on('error', reject);
  });
};

const images = {
  // Movies
  'kalki.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/mS52B5BwR6vEOfFzZ4rL0K31k1i.jpg',
  'deadpool.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  'pushpa.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/xd1wEXw1M2lZ1D63QikB077sE7q.jpg',
  'dune.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg',
  'oppenheimer.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  
  // Sports (Accurate imagery via TMDB documentaries and Unsplash)
  'ind-aus.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/1vKx4PqgEbwFf8a6E0k7P6sK1yE.jpg',
  'csk-mi.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/p9nSndhS6N9N08z19oD41j2W7B.jpg',
  'rcb-kkr.jpg': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop',
  'mi-dc.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/6xIqQ89iC1d5V9L4jU3N130hXnK.jpg',
  'pkl.jpg': 'https://wsrv.nl/?url=image.tmdb.org/t/p/w780/y3P0r45gU9q7Z6p9b4X2j5A1w4H.jpg',
  
  // Concerts
  'coldplay.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/ColdplayWembley120925_%28cropped%29.jpg',
  'arijit.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg',
  'diljit.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg',
  'dua.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Dua_Lipa-69798_%28cropped%29.jpg',
  'edsheeran.jpg': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg'
};

const outDir = path.join(__dirname, 'frontend/public/highres');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

async function run() {
  for (let [name, url] of Object.entries(images)) {
    try {
      await download(url, path.join(outDir, name));
      console.log('Downloaded ' + name);
    } catch(e) {
      console.log('Failed ' + name + ': ' + e);
    }
  }
}
run();
