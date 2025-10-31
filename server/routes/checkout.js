import express from "express";
import db from "../db.js";

const router = express.Router();

// 🧾 BUAT PESANAN BARU (checkout)
router.post("/", (req, res) => {
    const { user_id, address_id, total_amount, payment_method, items } = req.body;

    if (!user_id || !address_id || !items || items.length === 0) {
        return res.status(400).json({ message: "Data pesanan tidak lengkap!" });
    }

    // 1️⃣ Simpan order utama
    db.run(
        `INSERT INTO orders (user_id, address_id, total_amount, payment_method, status) 
     VALUES (?, ?, ?, ?, ?)`, [user_id, address_id, total_amount, payment_method, "waiting_payment"],
        function(err) {
            if (err) {
                console.error("❌ Gagal membuat pesanan:", err.message);
                return res.status(500).json({ error: err.message });
            }

            const orderId = this.lastID;
            console.log("✅ Pesanan baru dibuat:", orderId);

            // 2️⃣ Simpan semua item ke order_items
            const stmt = db.prepare(
                `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`
            );

            items.forEach((i) => {
                stmt.run(orderId, i.product_id, i.quantity, i.price);
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error("❌ Gagal menyimpan item pesanan:", err.message);
                    return res.status(500).json({ error: err.message });
                }

                // 3️⃣ Hapus isi keranjang user
                db.run(`DELETE FROM carts WHERE user_id = ?`, [user_id], (err) => {
                    if (err) {
                        console.error("⚠️ Gagal menghapus cart:", err.message);
                    }
                });

                // 4️⃣ Kirim respon ke frontend
                res.json({
                    message: "Pesanan berhasil dibuat!",
                    order_id: orderId,
                });
            });
        }
    );
});

// 🧾 LIHAT DAFTAR PESANAN USER
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.all(
        `SELECT o.id, o.total_amount, o.payment_method, o.status, o.created_at,
            a.full_address,
            GROUP_CONCAT(p.name || ' x' || oi.quantity, ', ') AS items
     FROM orders o
     JOIN addresses a ON o.address_id = a.id
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`, [user_id],
        (err, rows) => {
            if (err) {
                console.error("❌ Gagal ambil pesanan:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

export default router;