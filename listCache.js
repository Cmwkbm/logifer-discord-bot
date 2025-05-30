const fs = require('fs');
const path = require('path');

const cacheFile = path.resolve(__dirname, 'listCache.json');
let cache = {};

try {
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
} catch (err) {
  console.error('Failed to load list cache:', err);
}

function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

function storeList(token, listData) {
  cache[token] = { data: listData, timestamp: Date.now() };
  saveCache();
}

function getList(token) {
  return cache[token]?.data;
}

module.exports = { storeList, getList };
