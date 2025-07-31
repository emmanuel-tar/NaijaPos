// Cart management for Tsquare POS

export class CartManager {
  constructor() {
    this.cart = [];
    this.taxRate = 0.075; // 7.5% VAT
  }

  addItem(item) {
    const index = this.cart.findIndex(i => i.barcode === item.barcode);
    if (index >= 0) {
      this.cart[index].quantity += item.quantity;
    } else {
      this.cart.push(item);
    }
  }

  removeItem(barcode) {
    this.cart = this.cart.filter(i => i.barcode !== barcode);
  }

  calculateSubtotal() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  calculateTax() {
    return this.calculateSubtotal() * this.taxRate;
  }

  calculateTotal() {
    return this.calculateSubtotal() + this.calculateTax();
  }

  clearCart() {
    this.cart = [];
  }
