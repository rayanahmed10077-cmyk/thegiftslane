export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, transactionId } = req.body || {};

    if (!orderId || !transactionId) {
      return res.status(400).json({
        error: "Order ID and transaction ID are required"
      });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Supabase server environment variables are missing"
      });
    }

    const url =
      `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        payment_method: "upi",
        upi_transaction_id: transactionId.trim()
      })
    });

    const data = await response.json();

    if (!response.ok || !data.length) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    return res.status(200).json({
      ok: true,
      orderNumber: data[0].order_number
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
}
