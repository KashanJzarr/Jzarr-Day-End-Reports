const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 39871;
const tasksFile = path.join(__dirname, 'tasks.json');

const server = http.createServer((req, res) => {
  // CORS and Chrome Private Network Access headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (fs.existsSync(tasksFile)) {
    try {
      const data = fs.readFileSync(tasksFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'tasks.json not found' }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(` Jzarr Day End Report Local Sync Server`);
  console.log(` Running on: http://127.0.0.1:${PORT}`);
  console.log(` Watching:   ${tasksFile}`);
  console.log(`====================================================`);
  console.log(`Ab tasks.json ko save karein aur browser mein`);
  console.log(`"Fill Day End Report" bookmark dabayein!`);
});

