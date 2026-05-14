// /api/send-telegram.js

const APP_SECRET = process.env.APP_SECRET || 'HDNDT-JDHT8FNEK-JJHR';
const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID    = process.env.TELEGRAM_CHAT_ID;

module.exports = async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-secret-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Chỉ cho phép POST ───────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Kiểm tra secret key ─────────────────────────────────────
  const secret = req.headers['x-secret-key'];
  if (secret !== APP_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ── Kiểm tra env vars ───────────────────────────────────────
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // ── Lấy message từ body ─────────────────────────────────────
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  // ── Gửi lên Telegram ────────────────────────────────────────
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text:       message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram error:', result);
      return res.status(500).json({ error: 'Telegram API error', detail: result });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
