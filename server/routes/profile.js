import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

const router = express.Router();
const SECRET_KEY = "techzone-secret";

// AMBIL PROFIL
/*router.get("/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM user_profiles WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("❌ DB error:", err);
            return res.status(500).json({ error: "Gagal mengambil data" });
        }

        if (!row) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        res.json(row);
    });

    const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      p.full_name,
      p.birth_date,
      p.gender,
      p.phone,
      p.photo_url
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.id
    WHERE u.id = ?
  `; */

router.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        p.full_name,
        p.birth_date,
        p.gender,
        p.phone,
        p.photo_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.id
      WHERE u.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error("❌ DB error:", err);
            return res.status(500).json({ error: "Gagal mengambil data" });
        }

        if (!row) {
            return res.status(404).json({ message: "Profil tidak ditemukan" });
        }

        res.json(row);
    });
});


// BUAT PROFIL BARU
router.post("/", (req, res) => {
    const { id, full_name, birth_date, gender, email, phone, photo_url } = req.body;

    if (!id) return res.status(400).json({ message: "ID user tidak ditemukan" });

    // Cek dulu apakah user sudah punya profil
    db.get("SELECT id FROM user_profiles WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("❌ DB Error (select):", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Sudah ada -> UPDATE
            const updateSql = `
          UPDATE user_profiles
          SET full_name = ?, birth_date = ?, gender = ?, email = ?, phone = ?, photo_url = ?
          WHERE id = ?
        `;
            db.run(updateSql, [full_name, birth_date, gender, email, phone, photo_url, id], function(err2) {
                if (err2) {
                    console.error("❌ DB Error (update):", err2.message);
                    return res.status(500).json({ error: err2.message });
                }
                res.json({ message: "✅ Profil diperbarui!", id });
            });
        } else {
            // Belum ada -> INSERT baru
            const insertSql = `
          INSERT INTO user_profiles (id, full_name, birth_date, gender, email, phone, photo_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
            db.run(insertSql, [id, full_name, birth_date, gender, email, phone, photo_url], function(err3) {
                if (err3) {
                    console.error("❌ DB Error (insert):", err3.message);
                    return res.status(500).json({ error: err3.message });
                }
                res.json({ message: "✅ Profil baru dibuat!", id });
            });
        }
    });
});
// UPDATE PROFIL
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { full_name, birth_date, gender, email, phone, photo_url } = req.body;

    // 1️⃣ Update user_profiles — kalau belum ada, buat baru
    const checkSql = "SELECT id FROM user_profiles WHERE id = ?";
    db.get(checkSql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Sudah ada → UPDATE
            const updateSql = `
          UPDATE user_profiles
          SET full_name = ?, birth_date = ?, gender = ?, email = ?, phone = ?, photo_url = ?
          WHERE id = ?
        `;
            db.run(updateSql, [full_name, birth_date, gender, email, phone, photo_url, id], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });

                // Sekalian update nama & email di tabel users biar sinkron
                db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [full_name || "User", email, id], (err3) => {
                    if (err3) console.error("⚠️ Gagal sinkron ke users:", err3.message);
                    res.json({ message: "✅ Profil berhasil diperbarui!" });
                });
            });
        } else {
            // Belum ada → INSERT baru
            const insertSql = `
          INSERT INTO user_profiles (id, full_name, birth_date, gender, email, phone, photo_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
            db.run(insertSql, [id, full_name, birth_date, gender, email, phone, photo_url], (err4) => {
                if (err4) return res.status(500).json({ error: err4.message });
                res.json({ message: "✅ Profil baru dibuat!" });
            });
        }
    });
});


// HAPUS PROFIL
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM user_profiles WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Profil dihapus" });
    });
});


// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // simpan ke folder uploads/
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// === Route upload foto profil ===
router.post("/upload-photo/:id", upload.single("photo"), (req, res) => {
    const { id } = req.params;
    if (!req.file)
        return res.status(400).json({ message: "Tidak ada file yang diunggah" });

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const sql = "UPDATE user_profiles SET photo_url = ? WHERE id = ?";
    db.run(sql, [imageUrl, id], (err) => {
        if (err) {
            console.error("❌ DB Error (update photo):", err.message);
            return res.status(500).json({ message: "Gagal menyimpan foto" });
        }

        console.log(`📸 Foto profil user ${id} berhasil diupload: ${imageUrl}`);
        res.json({
            message: "✅ Foto profil berhasil diupload!",
            photo_url: imageUrl,
        });
    });
});



export default router;