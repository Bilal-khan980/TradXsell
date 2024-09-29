const express = require('express');
const CartItem = require('../Schemas/CartSchema.js');

const app = express.Router();

// Add or update item in cart
app.post('/add', async (req, res) => {
    const { email, username, productId, name, price, imageUrl, quantity } = req.body;

    try {
        // Check if the item already exists in the cart
        const existingItem = await CartItem.findOne({ email, productId });

        if (existingItem) {
            // If the item exists, update the quantity
            existingItem.quantity += quantity;
            await existingItem.save();
        } else {
            // If the item does not exist, create a new cart item
            const newItem = new CartItem({
                email,
                username,
                productId,
                name,
                price,
                imageUrl,
                quantity
            });

            await newItem.save();
        }

        return res.status(201).json({ success: true, message: 'Item added to cart' });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        return res.status(500).json({ success: false, message: 'Failed to add item to cart' });
    }
});

// Get cart items for a user
app.get('/:email', async (req, res) => {
    const userEmail = req.params.email;

    try {
        const cartItems = await CartItem.find({ email: userEmail });
        return res.status(200).json(cartItems);
    } catch (err) {
        console.error('Error fetching cart items:', err);
        return res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

// Increase item quantity
app.post('/increase', async (req, res) => {
    const { email, productId } = req.body;

    try {
        const item = await CartItem.findOne({ email, productId });
        if (item) {
            item.quantity += 1; // Increase quantity by 1
            await item.save();
            return res.status(200).json({ success: true, message: 'Item quantity increased' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error increasing quantity:', error);
        res.status(500).json({ error: 'Failed to increase quantity' });
    }
});

// Decrease item quantity
app.post('/decrease', async (req, res) => {
    const { email, productId } = req.body;

    try {
        const item = await CartItem.findOne({ email, productId });
        if (item && item.quantity > 1) {
            item.quantity -= 1; // Decrease quantity by 1
            await item.save();
            return res.status(200).json({ success: true, message: 'Item quantity decreased' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found or quantity is already 1' });
        }
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        res.status(500).json({ error: 'Failed to decrease quantity' });
    }
});

// Remove item from cart
app.delete('/remove/:email/:productId', async (req, res) => {
    const { email, productId } = req.params;

    try {
        const result = await CartItem.deleteOne({ email, productId });
        if (result.deletedCount === 1) {
            return res.status(200).json({ success: true, message: 'Item removed from cart' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

module.exports = app;
