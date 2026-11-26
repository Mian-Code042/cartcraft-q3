require('dotenv').config();
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';
const ROLL_N = Number(process.env.ROLL_NUMBER || 910);

async function run() {
  console.log(`=== CartCraft Idempotency & Shipping Verification (Roll N = ${ROLL_N}) ===`);
  console.log(`Personal Rules -> Flat Shipping: ${50 + ROLL_N}, Free Shipping Threshold: ${1000 + ROLL_N}\n`);

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'miannisarulhassan042@gmail.com', password: 'Password123' }),
  });
  const { token } = await loginRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const productsRes = await fetch(`${BASE_URL}/products`, { headers });
  const products = await productsRes.json();
  const keyboard = products.find((p) => p.name.includes('Keyboard'));
  console.log(`Product: "${keyboard.name}" | Price: ${keyboard.price} | Stock BEFORE: ${keyboard.stock}`);

  await fetch(`${BASE_URL}/cart/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId: keyboard._id, quantity: 1 }),
  });

  const sameKey = 'idem-' + crypto.randomUUID();
  console.log(`\nSending 2 simultaneous checkout requests with Idempotency-Key: ${sameKey}`);

  const [res1, res2] = await Promise.all([
    fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: { ...headers, 'Idempotency-Key': sameKey },
    }).then(async (r) => ({ status: r.status, body: await r.json() })),
    fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: { ...headers, 'Idempotency-Key': sameKey },
    }).then(async (r) => ({ status: r.status, body: await r.json() })),
  ]);

  console.log('\nResponse 1:', JSON.stringify(res1, null, 2));
  console.log('\nResponse 2:', JSON.stringify(res2, null, 2));

  const productsAfterRes = await fetch(`${BASE_URL}/products`, { headers });
  const productsAfter = await productsAfterRes.json();
  const keyboardAfter = productsAfter.find((p) => p._id === keyboard._id);

  console.log(`\nStock AFTER: ${keyboardAfter.stock} (Reduced by ${keyboard.stock - keyboardAfter.stock} unit only!)`);
  console.log(`Same Order ID returned? ${res1.body.order._id === res2.body.order._id}`);
}

run().catch(console.error);
