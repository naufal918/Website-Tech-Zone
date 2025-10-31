import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();
const SECRET_KEY = "techzone-secret";
const userId = uuidv4();

// REGISTER USER
router.post("/register", async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: "Data tidak lengkap" });

    db.run(
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)", [userId, name, email, hashed, "user"],
        (err) => {
            if (err) return res.status(500).json({ message: "Gagal membuat akun" });

            const token = jwt.sign({ id: userId, role: "user" }, SECRET_KEY, {
                expiresIn: "1d",
            });

            res.json({
                message: "✅ Akun berhasil dibuat!",
                id: userId,
                name,
                email,
                role: "user",
                token,
            });
        }
    );
});

// LOGIN USER
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async(err, user) => {
        if (err) return res.status(500).json({ message: "Kesalahan database" });
        if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Password salah!" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: "1d",
        });

        res.json({
            message: "Login sukses!",
            token,
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
        });
    });
});

export default router;