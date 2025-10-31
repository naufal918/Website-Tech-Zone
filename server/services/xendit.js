import axios from "axios";

const XENDIT_API_KEY = process.env.XENDIT_API_KEY;

// ✅ Fungsi bikin QRIS charge ke Xendit
export async function createQrisCharge(orderId, amount, customerName = "Customer") {
    // Kalau belum punya API key → mode dummy
    if (!XENDIT_API_KEY) {
        console.log("⚠️  XENDIT_API_KEY belum diset, pakai mode dummy QRIS");
        return {
            provider_id: "dummy-" + Date.now(),
            qr_string: `https://dummy-qris-page.test/pay/${orderId}`,
            amount,
        };
    }

    try {
        const headers = {
            Authorization: "Basic " + Buffer.from(XENDIT_API_KEY + ":").toString("base64"),
            "Content-Type": "application/json",
        };

        const payload = {
            reference_id: `order-${orderId}`,
            type: "DYNAMIC",
            currency: "IDR",
            amount: Number(amount), // pastikan ini number
            metadata: { orderId },
            callback_url: "https://example.com/payment/callback",
            customer_name: customerName,
        };

        // 🔹 Endpoint resmi QRIS Xendit
        const res = await axios.post("https://api.xendit.co/qris/charges", payload, { headers });

        console.log("✅ QRIS sukses dibuat:", res.data);

        return {
            provider_id: res.data.id,
            qr_string: res.data.qr_string,
            amount: res.data.amount,
            expires_at: res.data.expires_at,
        };
    } catch (err) {
        console.error("🟥 Xendit API Error:", err.response && data || err.message);
        throw new Error(err.response && data && message || "QRIS creation failed");
    }
}