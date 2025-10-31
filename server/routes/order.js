// routes/orders.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');


// create order
router.post('/', (req, res) => {
    const { user_id, items, total } = req.body; // items = [{productId, qty, price}]
    if (!items || !total) return res.status(400).json({ error: 'items & total required' });
    const created_at = new Date().toISOString();
    db.run(`INSERT INTO orders (user_id,items,total,status,created_at) VALUES (?,?,?,?,?)`, [user_id, JSON.stringify(items), total, 'pending', created_at], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, orderId: this.lastID });
    });
});


// get order
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM orders WHERE id=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    });
});




module.exports = router;