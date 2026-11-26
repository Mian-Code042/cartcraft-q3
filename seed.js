require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const IdempotencyRecord = require('./models/IdempotencyRecord');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    IdempotencyRecord.deleteMany({}),
  ]);

  await User.create([
    { name: 'Admin Nisar', email: 'admin@cartcraft.com', password: 'Password123', role: 'admin' },
    { name: 'Mian Nisar ul Hassan', email: 'miannisarulhassan042@gmail.com', password: 'Password123', role: 'customer' },
  ]);

  await Product.create([
    { name: 'Wireless Mechanical Keyboard', price: 800, stock: 5 },
    { name: '4K USB-C Hub Adapter', price: 1200, stock: 3 },
    { name: 'Limited Edition Studio Headset', price: 2200, stock: 1 },
  ]);

  console.log('Seed completed!');
  console.log('Admin:    admin@cartcraft.com / Password123');
  console.log('Customer: miannisarulhassan042@gmail.com / Password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
