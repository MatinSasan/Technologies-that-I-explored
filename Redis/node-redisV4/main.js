// what I could understrand about V4 so far
// V3 is for now easier for me to understand adn work on
const redis = require('redis');

const client = redis.createClient();

client.on('error', (err) => console.log(`redis cli error`, err));

(async function () {
  await client.connect();
  await client.set('key', 'value', { EX: 10 });
  const value = await client.get('key');
  console.log(value);
  await client.quit();
})();
