const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Redis = require('redis'); //redis@3.X (I couldn't make it work on @4.X yet)
// Windows:
// WSL terminal: redis-server
// another WSL terminal: redis-cli
// hit those endpoints with apps like Postman

const client = Redis.createClient({ legacyMode: true });
const DEFAULT_EXPIRATION = 30;

const app = express();
app.use(cors());

app.get('/photos', async (req, res) => {
  const albumId = req.query.albumId;
  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos`,
      { params: { albumId } }
    );
    return data;
  });

  res.json(photos);
});

app.get('/photos/:id', async (req, res) => {
  const photo = await getOrSetCache(`photos:${req.params.id}`, async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );
    return data;
  });

  res.json(photo);
});

function getOrSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    client.get(key, async (err, data) => {
      if (err) return reject(err);
      if (data !== null) {
        console.log('cache!');
        return resolve(JSON.parse(data));
      }
      const freshData = await cb();
      client.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      console.log('no cache!');
      resolve(freshData);
    });
  });
}

app.listen(3000, () => console.log('server running on 3000...'));
