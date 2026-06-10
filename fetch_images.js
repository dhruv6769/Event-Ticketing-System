const https = require('https');

function fetchWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`;
    https.get(url, { headers: { 'User-Agent': 'TicketingApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].original) {
            resolve(pages[pageId].original.source);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function run() {
  const queries = [
    'Music of the Spheres World Tour',
    'Arijit Singh',
    'Diljit Dosanjh',
    'Dua Lipa',
    'Ed Sheeran',
    'India national cricket team',
    'Chennai Super Kings',
    'Royal Challengers Bangalore',
    'Mumbai Indians',
    'Pro Kabaddi League',
    'Kalki 2898 AD',
    'Deadpool & Wolverine',
    'Pushpa 2: The Rule',
    'Dune: Part Two',
    'Oppenheimer (film)'
  ];

  for (const q of queries) {
    const url = await fetchWikiImage(q);
    console.log(`"${q}": "${url}",`);
  }
}

run();
