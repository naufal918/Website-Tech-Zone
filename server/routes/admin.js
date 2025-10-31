// routes/admin.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyAdmin } from "../middleware/authAdmin.js";
import db from "../db.js";
const router = express.Router();

const JWT_SECRET = "secret_dev_key";
// harus sama dengan di route login

// ==========================================================
// 🧠 LOGIN ADMIN
// ==========================================================
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM admins WHERE email = ?`, [email], async(err, admin) => {
        if (err) return res.status(500).json({ message: "Gagal membaca database." });
        if (!admin) return res.status(401).json({ message: "Email tidak ditemukan." });

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return res.status(401).json({ message: "Password salah." });
        console.log("🧩 Data admin dari DB:", admin);
        const token = jwt.sign({
                id: admin.id,
                role: admin.role,
            },
            JWT_SECRET, { expiresIn: "30d" }
        );
        res.json({
            message: "Login sukses!",
            token,
            role: admin.role,
            name: admin.name,
            email: admin.email,
        });
    });
});

// ==========================================================
// 🍰 CRUD PRODUK (Hanya Admin yang bisa akses)
// ==========================================================

// 🔹 GET semua produk
router.get("/products", verifyAdmin, (req, res) => {
    db.all(`SELECT * FROM products ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 🔹 Tambah produk baru
router.post("/products", verifyAdmin, (req, res) => {
    const { name, description, price, stock, imageUrl, tags } = req.body;
    const created_at = new Date().toISOString();

    db.run(
        `INSERT INTO products (name, description, price, stock, imageUrl, tags, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, description, price, stock, imageUrl, tags, created_at],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// 🔹 Update produk
router.put("/products/:id", verifyAdmin, (req, res) => {
    const { name, description, price, stock, imageUrl, tags } = req.body;

    db.run(
        `UPDATE products SET name=?, description=?, price=?, stock=?, imageUrl=?, tags=? WHERE id=?`, [name, description, price, stock, imageUrl, tags, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// 🔹 Hapus produk
router.delete("/products/:id", verifyAdmin, (req, res) => {
    db.run(`DELETE FROM products WHERE id=?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

export default router;