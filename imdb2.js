const https = require('https');
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
};
const ids = {
  'kalki': 'tt12735488',
  'pushpa': 'tt15312334',
  'dune': 'tt15239678'
};
for(let [name, id] of Object.entries(ids)) {
  https.get(`https://www.imdb.com/title/${id}/`, options, res => {
    let d=''; res.on('data', c=>d+=c);
    res.on('end', () => {
      const m = d.match(/<meta property="og:image" content="([^"]+)"/);
      console.log(name + ': ' + (m ? m[1] : 'Not found'));
    });
  });
}
