// routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import db from "../db.js";
import { verifyAdmin } from "../middleware/authAdmin.js";

const router = express.Router();

// === Konfigurasi Upload Gambar ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// =======================================================
// ✅ 1. Tambah Produk (Admin)
// =======================================================
router.post("/", verifyAdmin, upload.single("image"), (req, res) => {
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const created_at = new Date().toISOString();

    db.run(
        `INSERT INTO products (name, description, price, stock, category, imageUrl, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, description, price, stock, category, imageUrl, created_at],
        function(err) {
            if (err) return res.status(500).json({ message: "❌ Gagal menambahkan produk." });
            res.json({ message: "✅ Produk berhasil ditambahkan!", id: this.lastID });
        }
    );
});

// =======================================================
// ✏️ 2. Update Produk (Admin)
// =======================================================
router.put("/:id", verifyAdmin, upload.single("image"), (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
        `UPDATE products
     SET name = ?, description = ?, price = ?, stock = ?, category = ?, 
         imageUrl = COALESCE(?, imageUrl)
     WHERE id = ?`, [name, description, price, stock, category, imageUrl, id],
        function(err) {
            if (err) return res.status(500).json({ message: "❌ Gagal memperbarui produk." });
            if (this.changes === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
            res.json({ message: "✏️ Produk berhasil diperbarui!" });
        }
    );
});

// =======================================================
// 🗑️ 3. Hapus Produk (Admin)
// =======================================================
router.delete("/:id", verifyAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ message: "❌ Gagal menghapus produk." });
        if (this.changes === 0) return res.status(404).json({ message: "Produk tidak ditemukan." });
        res.json({ message: "🗑️ Produk berhasil dihapus!" });
    });
});

// =======================================================
// 📂 4. Ambil Produk Berdasarkan Kategori (Public)
// =======================================================
router.get("/category/:categoryName", (req, res) => {
    const { categoryName } = req.params;
    const query = `SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY created_at DESC`;

    db.all(query, [categoryName], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// =======================================================
// 📋 5. Ambil Semua Produk (Public)
// =======================================================
router.get("/", (req, res) => {
    db.all("SELECT * FROM products ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// =======================================================
// 🔍 6. Ambil Produk Berdasarkan ID (Public)
// =======================================================
router.get("/search", (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ results: [] });

    const sql = `SELECT id, name, price, imageUrl FROM products WHERE name LIKE ? LIMIT 20`;
    const params = [`%${q}%`];

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("❌ Gagal mencari produk:", err.message);
            return res.status(500).json({ error: "Kesalahan server" });
        }
        res.json({ results: rows });
    });
});

// =======================================================
// 🔍 Ambil produk berdasarkan ID (Public)
// =======================================================
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ message: "❌ Gagal mengambil produk." });
        if (!row) return res.status(404).json({ message: "Produk tidak ditemukan." });
        res.json(row);
    });
});

export default router;