import express from "express";
import db from "../db.js";

const router = express.Router();

// 🔹 Tambah alamat baru
router.post("/", (req, res) => {
    const { user_id, label, recipient_name, phone, full_address, notes } = req.body;

    // 🔍 Cek dulu apakah alamat dengan data sama sudah ada
    const checkQuery = `
        SELECT id FROM addresses
        WHERE user_id = ? 
        AND label = ? 
        AND recipient_name = ? 
        AND phone = ? 
        AND full_address = ? 
        AND notes = ?
        LIMIT 1
    `;

    db.get(checkQuery, [user_id, label, recipient_name, phone, full_address, notes], (err, existing) => {
        if (err) {
            console.error("❌ Gagal cek alamat:", err);
            return res.status(500).json({ error: "Gagal memeriksa alamat" });
        }

        if (existing) {
            // ✅ Kalau alamat sudah ada, jangan insert lagi
            return res.status(200).json({
                message: "Alamat sudah ada",
                id: existing.id,
            });
        }

        // 🆕 Kalau belum ada, baru insert
        const insertQuery = `
            INSERT INTO addresses (user_id, label, recipient_name, phone, full_address, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;

        db.run(
            insertQuery, [user_id, label, recipient_name, phone, full_address, notes],
            function(err) {
                if (err) {
                    console.error("❌ Gagal simpan alamat:", err);
                    return res.status(500).json({ error: "Gagal menambahkan alamat" });
                }

                res.json({
                    message: "Alamat berhasil ditambahkan",
                    id: this.lastID,
                });
            }
        );
    });
});


// 🔹 Ambil semua alamat milik user
router.get("/user/:userId", (req, res) => {
    const { userId } = req.params;
    console.log("🔥 Masuk route /addresses/user/:userId dengan ID =", userId);

    db.all(
        "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC", [userId],
        (err, rows) => {
            if (err) {
                console.error("❌ Gagal ambil alamat:", err);
                return res.status(500).json({ error: "Gagal ambil alamat" });
            }

            console.log("✅ Hasil query:", rows);
            res.json(rows); // <== 🔥 PASTI kirim array
        }
    );
});

// 🔹 Hapus alamat berdasarkan ID
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM addresses WHERE id = ?", [id], function(err) {
        if (err) {
            console.error("❌ Gagal hapus alamat:", err);
            return res.status(500).json({ error: "Gagal menghapus alamat" });
        }

        res.json({ message: "Alamat berhasil dihapus" });
    });
});

// 🔹 Update alamat
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { label, recipient_name, phone, full_address, notes } = req.body;

    db.run(
        `UPDATE addresses 
     SET label = ?, recipient_name = ?, phone = ?, full_address = ?, notes = ?
     WHERE id = ?`, [label, recipient_name, phone, full_address, notes, id],
        function(err) {
            if (err) {
                console.error("❌ Gagal update alamat:", err);
                return res.status(500).json({ error: "Gagal memperbarui alamat" });
            }

            res.json({ message: "Alamat berhasil diperbarui" });
        }
    );
});

export default router;