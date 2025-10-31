//(notifikasi dari Xendit)
import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/xendit", (req, res) => {
    const { reference_id, status } = req.body;

    console.log("📩 Webhook diterima:", req.body);

    if (status === "COMPLETED") {
        const orderId = reference_id.replace("order-", "");
        db.run(`UPDATE orders SET status = 'paid' WHERE id = ?`, [orderId]);
    }

    res.sendStatus(200);
});

export default router;