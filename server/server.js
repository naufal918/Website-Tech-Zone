// ==================== IMPORT MODULE ====================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3"; // ✅ penting!
import { open } from "sqlite"; // ✅ penting!
import { Server } from "socket.io";
import http from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import dotenv from "dotenv";

// === Routes ===
import profileRoutes from "./routes/profile.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import productsRouter from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import webhookRoutes from "./routes/webhook.js";
import checkoutRoutes from "./routes/checkout.js";
import addressRoutes from "./routes/addresses.js";

// ==================== SETUP DASAR ====================
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "techzone-secret";

// === koneksi database SQLite ===
const dbPromise = open({
    filename: "./kue_store.db", // path database kamu
    driver: sqlite3.Database,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Hubungkan koneksi db.js ke semua route (pakai req.app.locals.db)
app.locals.db = db;

// ==================== SOCKET.IO ====================
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

// ==================== ROUTES ====================
app.use("/addresses", addressRoutes);
app.use("/products", productsRouter);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/profile", profileRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/cart", cartRoutes);
app.use("/webhook", webhookRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
    res.send("TechZone API aktif 🚀");
});

// ==================== REGISTER USER ====================
app.post("/auth/register", async(req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "Data tidak lengkap" });

    db.get("SELECT * FROM users WHERE email = ?", [email], async(err, row) => {
        if (err) return res.status(500).json({ message: "Kesalahan database" });
        if (row) return res.status(400).json({ message: "Email sudah terdaftar" });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, "user"],
                function(err) {
                    if (err) {
                        console.error("❌ DB Insert Error:", err.message);
                        return res.status(500).json({ message: "Gagal menyimpan user" });
                    }

                    const userId = this.lastID;
                    console.log(`✅ User baru terdaftar: ${email} (id: ${userId})`);

                    db.run(
                        `INSERT INTO user_profiles 
             (id, full_name, birth_date, gender, email, phone, photo_url)
             VALUES (?, '', '', '', ?, '', '')`, [userId, email],
                        (err2) => {
                            if (err2)
                                console.warn("⚠️ Gagal membuat profil default:", err2.message);
                            else
                                console.log(`🪪 Profil kosong dibuat untuk user id ${userId}`);
                        }
                    );

                    res.json({
                        message: "✅ Akun berhasil dibuat! Silakan login.",
                        id: userId,
                        name,
                        email,
                        role: "user",
                    });
                }
            );
        } catch (e) {
            console.error("❌ Register Error:", e);
            res.status(500).json({ message: "Terjadi kesalahan server" });
        }
    });
});

// ==================== LOGIN (ADMIN / USER) ====================
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM admins WHERE email = ?", [email], async(err, admin) => {
        if (err) {
            console.error("❌ DB Error (admin):", err);
            return res.status(500).json({ message: "DB Error" });
        }

        if (admin) {
            const match = await bcrypt.compare(password, admin.password);
            if (!match) return res.status(401).json({ message: "Password salah!" });

            const token = jwt.sign({ id: admin.id, role: "admin" }, SECRET_KEY, {
                expiresIn: "1d",
            });

            console.log(`👑 Admin ${admin.email} berhasil login`);

            return res.json({
                message: "Login sukses!",
                token,
                role: "admin",
                name: admin.name,
                email: admin.email,
            });
        }

        db.get("SELECT * FROM users WHERE email = ?", [email], async(err, user) => {
            if (err) {
                console.error("❌ DB Error (user):", err);
                return res.status(500).json({ message: "DB Error" });
            }

            if (!user) {
                console.warn("⚠️ Email tidak ditemukan:", email);
                return res.status(404).json({ message: "Email tidak ditemukan" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                console.warn("⚠️ Password salah untuk:", email);
                return res.status(401).json({ message: "Password salah!" });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
                expiresIn: "1d",
            });

            console.log(`👤 User ${user.email} login (id: ${user.id})`);

            return res.json({
                message: "Login sukses!",
                token,
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
            });
        });
    });
});

// ==================== DELETE ACCOUNT ====================
// ==================== DELETE ACCOUNT ====================
// ==================== DELETE ACCOUNT (FINAL FIX) ====================
app.delete("/deleteAccount/:id", async(req, res) => {
    const userId = req.params.id;
    const dbConn = await dbPromise;

    try {
        // Hapus data payments lewat relasi ke orders
        await dbConn.run(
            "DELETE FROM payments WHERE id IN (SELECT id FROM payments WHERE id IN (SELECT id FROM orders WHERE user_id = ?))", [userId]
        );

        // Hapus order_items berdasarkan order_id milik user ini
        await dbConn.run(
            "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", [userId]
        );

        // Hapus semua order user
        await dbConn.run("DELETE FROM orders WHERE user_id = ?", [userId]);

        // Hapus cart, address, profile, dan user
        await dbConn.run("DELETE FROM carts WHERE user_id = ?", [userId]);
        await dbConn.run("DELETE FROM addresses WHERE user_id = ?", [userId]);
        await dbConn.run("DELETE FROM user_profiles WHERE id = ?", [userId]);
        await dbConn.run("DELETE FROM users WHERE id = ?", [userId]);

        console.log(`🗑️ User ID ${userId} dan semua datanya berhasil dihapus.`);
        res.json({ success: true, message: "Akun dan semua data berhasil dihapus." });
    } catch (error) {
        console.error("❌ Error deleting account:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus akun." });
    }
});


// ==================== JALANKAN SERVER ====================
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});