// middleware/authAdmin.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "secret_dev_key"; // HARUS sama dengan yang di admin.js

export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Akses ditolak. Hanya admin yang boleh!" });
        }

        req.user = decoded; // simpan data admin ke request
        next();
    } catch (err) {
        console.error("❌ Token error:", err.message);
        return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
    }
};