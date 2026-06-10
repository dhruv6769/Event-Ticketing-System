const https = require('https');
const fs = require('fs');

function search(query) {
  return new Promise(res => {
    https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' poster'), {headers: {'User-Agent': 'Mozilla/5.0'}}, resp => {
      let d=''; resp.on('data', c=>d+=c);
      resp.on('end', () => {
        const m = d.match(/<img class="result__icon__img" src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&"]+)/);
        if(m) res(decodeURIComponent(m[1])); else res(null);
      });
    });
  });
}

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

async function run() {
  const qs = {
    'kalki': 'Kalki 2898 AD official poster vertical',
    'pushpa': 'Pushpa 2 The Rule official poster vertical',
    'dune': 'Dune Part Two IMAX poster',
    'ind-aus': 'India vs Australia cricket action shot vertical',
    'csk-mi': 'CSK MS Dhoni IPL vertical',
    'mi-dc': 'Mumbai Indians Rohit Sharma IPL vertical',
    'pkl': 'Pro Kabaddi League action vertical',
    'edsheeran': 'Ed Sheeran concert tour poster vertical'
  };
  
  for(let [name, q] of Object.entries(qs)) {
    const url = await search(q);
    console.log(name + ': ' + url);
    if(url) {
      try {
        await download(url, 'frontend/public/highres/' + name + '.jpg');
        console.log('Downloaded ' + name);
      } catch(e) { console.log('Failed ' + name + ': ' + e); }
    }
  }
}
run();
