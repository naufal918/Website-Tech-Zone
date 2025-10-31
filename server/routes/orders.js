import express from "express";
import db from "../db.js";

const router = express.Router();

// 🔹 Buat pesanan baru
router.post("/", (req, res) => {
    const {
        user_id,
        address_id,
        total_amount,
        payment_method,
        status,
    } = req.body;

    console.log("🟢 Data pesanan diterima di backend:");
    console.log(req.body);

    // Validasi data wajib
    if (!user_id || !address_id || !total_amount || !payment_method) {
        console.warn("⚠️ Data pesanan tidak lengkap:", req.body);
        return res
            .status(400)
            .json({
                error: "Data pesanan tidak lengkap (user_id, address_id, total_amount, payment_method wajib diisi)",
            });
    }

    const created_at = new Date().toISOString();

    db.run(
        `INSERT INTO orders (user_id, address_id, total_amount, payment_method, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`, [
            user_id,
            address_id,
            total_amount,
            payment_method,
            status || "pending",
            created_at,
        ],
        function(err) {
            if (err) {
                console.error("❌ Gagal membuat pesanan:", err.message);
                return res.status(500).json({ error: err.message });
            }

            console.log("✅ Pesanan baru dibuat dengan ID:", this.lastID);
            res.json({ success: true, orderId: this.lastID });
        }
    );
});

// 🔹 Ambil semua pesanan user
router.get("/user/:userId", (req, res) => {
    const { userId } = req.params;

    db.all(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId],
        (err, rows) => {
            if (err) {
                console.error("❌ Gagal ambil pesanan:", err.message);
                return res.status(500).json({ success: false, message: "DB Error" });
            }

            res.json({
                success: true,
                orders: rows, // 🔹 dibungkus di key 'orders'
            });
        }
    );
});

// 🔹 Ambil detail pesanan tertentu
router.get("/", (req, res) => {
    db.all("SELECT * FROM orders", (err, rows) => {
        if (err) {
            console.error("❌ Gagal ambil semua order:", err.message);
            return res.status(500).json({ error: "Gagal ambil data orders" });
        }
        res.json(rows);
    });
});

// 🔹 Ambil 1 order berdasarkan ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("❌ Gagal ambil order:", err.message);
            return res.status(500).json({ error: "Gagal ambil data order" });
        }
        if (!row) {
            return res.status(404).json({ message: "Order tidak ditemukan" });
        }
        res.json(row);
    });
});

// 🔹 Ambil semua pesanan milik user tertentu
router.get("/user/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = `
      SELECT id, total_amount, status, created_at 
      FROM orders 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error("❌ Gagal ambil riwayat pesanan:", err.message);
            return res.status(500).json({ success: false, message: "DB Error" });
        }

        res.json({
            success: true,
            orders: rows,
        });
    });
});


export default router;