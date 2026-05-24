export default async function handler(req, res) {
  try {
    await fetch('https://royal-estate-ai.onrender.com/docs');
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
}