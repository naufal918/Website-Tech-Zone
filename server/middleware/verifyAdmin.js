import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Akses ditolak, hanya admin yang diperbolehkan!" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token tidak valid!" });
    }
};