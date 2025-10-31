// routes/cart.js
import express from "express";
import db from "../db.js"; // ⬅️ kamu lupa import db di sini

const router = express.Router();

// 📦 Contoh endpoint
router.get("/", (req, res) => {
    res.json({ message: "Cart API aktif 🚀" });
});

// ➕ Tambahkan produk ke keranjang
router.post("/", (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    console.log("🧾 Data diterima:", req.body); // buat debug

    if (!user_id || !product_id) {
        return res.status(400).json({ message: "Data tidak lengkap!" });
    }

    db.run(
        `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)`, [user_id, product_id, quantity || 1],
        function(err) {
            if (err) {
                console.error("SQL error:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Produk berhasil ditambahkan ke keranjang!" });
        }
    );
});

// 📋 Ambil isi keranjang user
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.all(
        `SELECT carts.id, carts.quantity, products.name, products.price, products.imageUrl
     FROM carts
     JOIN products ON carts.product_id = products.id
     WHERE carts.user_id = ?`, [user_id],
        (err, rows) => {
            if (err) {
                console.error("SQL Error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            console.log("🛒 Data cart user:", rows);
            res.json(rows);
        }
    );
});

// ❌ Hapus item dari keranjang
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM carts WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item dihapus dari keranjang." });
    });
});

// Hapus semua item cart berdasarkan user_id
router.delete("/user/:user_id", async(req, res) => {
    try {
        const { user_id } = req.params;
        await pool.query("DELETE FROM cart WHERE user_id = ?", [user_id]);
        res.json({ message: "Cart dikosongkan setelah checkout" });
    } catch (err) {
        console.error("Gagal hapus cart:", err);
        res.status(500).json({ error: "Gagal hapus cart user" });
    }
});

// ⚡ ESM style export (bukan module.exports)
export default router;