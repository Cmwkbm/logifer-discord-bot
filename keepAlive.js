// keepalive.js
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Logifer is alive!');
});

app.listen(port, () => {
  console.log(`✅ Keep-alive web server running on port ${port}`);
});