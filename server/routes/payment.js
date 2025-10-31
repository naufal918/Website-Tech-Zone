import express from "express";
import { createQrisCharge } from "../services/xendit.js";
import db from "../db.js"; // ✅ langsung import koneksi database

const router = express.Router();

// 🔹 Endpoint untuk bikin QRIS
router.post("/qris", async(req, res) => {
    try {
        const { order_id, amount, customer_name } = req.body;
        console.log("📦 Data dari frontend:", req.body);

        if (!order_id || !amount) {
            return res.status(400).json({
                success: false,
                message: "order_id dan amount wajib diisi",
            });
        }

        // 🔹 Panggil fungsi QRIS dari Xendit
        const qris = await createQrisCharge(order_id, amount, customer_name);

        res.json({
            success: true,
            qr_string: qris.qr_string,
            expires_at: qris.expires_at,
        });
    } catch (err) {
        console.error("❌ Gagal membuat QRIS:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// 🔹 Dummy cek status pembayaran
router.get("/status/:order_id", async(req, res) => {
    const { order_id } = req.params;

    try {
        // Simulasi: setelah 30 detik dari pembuatan dianggap "paid"
        const now = Date.now();
        const createdTime = parseInt(order_id.toString().slice(-8)); // acak aja buat simulasi
        const isPaid = now - createdTime > 30000; // 30 detik

        // 🔹 Update status pesanan di DB kalau sudah dibayar
        if (isPaid) {
            db.run("UPDATE orders SET status = ? WHERE id = ?", ["paid", order_id], (err) => {
                if (err) {
                    console.error("❌ Gagal update status pesanan:", err.message);
                } else {
                    console.log(`✅ Pesanan ${order_id} ditandai sebagai PAID`);
                }
            });
        }

        res.json({
            success: true,
            order_id,
            status: isPaid ? "paid" : "pending",
        });
    } catch (err) {
        console.error("❌ Error cek status pembayaran:", err.message);
        res.status(500).json({
            success: false,
            message: "Gagal cek status pembayaran",
        });
    }
});

export default router;