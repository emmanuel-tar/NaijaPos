import { CartManager } from './cart.js';

const cart = new CartManager();

// Dummy store info (can be updated later)
const storeInfo = {
  name: 'Tsquare Supermart',
  address: 'Plot 12, Allen Avenue, Ikeja, Lagos',
  phone: '+234-809-123-4567'
};

// Example product
const dummyProduct = {
  name: 'Indomie Super Pack',
  barcode: '1234567890123',
  price: 700,
  quantity: 1
};

// Add to cart
document.getElementById('add-btn').addEventListener('click', () => {
  cart.addItem(dummyProduct);
  alert('Item added to cart.');
});

// Print receipt
document.getElementById('print-btn').addEventListener('click', () => {
  const receipt = cart.generateReceipt(storeInfo);
  console.log(receipt);
  alert('Check console for receipt printout');
});
