import sqlite3 from "sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

// === fix __dirname di ESM ===
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "kue_store.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB ERR:", err.message);
    else console.log("✅ SQLite connected:", dbPath);
});

// === CREATE TABLES ===
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    reset_token TEXT,
    reset_expires INTEGER
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price INTEGER,
    stock INTEGER,
    imageUrl TEXT,
    tags TEXT,
    created_at TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    items TEXT,
    total INTEGER,
    status TEXT,
    payment_provider TEXT,
    payment_id TEXT,
    qris_url TEXT,
    created_at TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    provider TEXT,
    provider_id TEXT,
    amount INTEGER,
    status TEXT,
    raw_response TEXT
  )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      birth_date TEXT,
      gender TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      photo_url TEXT,
      FOREIGN KEY (id) REFERENCES users(id)
    )
  `);
});

// === Default admin ===
const adminEmail = "admin@techzone.com";
const adminName = "Super Admin";
const adminPass = "admin123";

bcrypt.hash(adminPass, 10, (err, hashedPassword) => {
    if (err) return console.error("❌ Gagal hash password:", err);

    const id = uuidv4();
    db.get("SELECT * FROM admins WHERE email = ?", [adminEmail], (err, row) => {
        if (err) return console.error("❌ Error cek admin:", err.message);

        if (!row) {
            db.run(
                `INSERT INTO admins (id, email, password, name) VALUES (?, ?, ?, ?)`, [id, adminEmail, hashedPassword, adminName],
                (err) => {
                    if (err) return console.error("❌ Gagal insert admin:", err.message);
                    console.log("✅ Admin default berhasil dibuat!");
                    console.log("📧 Email:", adminEmail);
                    console.log("🔑 Password:", adminPass);
                }
            );
        } else {
            console.log("ℹ️ Admin sudah ada, tidak perlu membuat ulang.");
        }
    });
});

// === Export db ===
export default db;