export default async function handler(req, res) {
  try {
    const SHEET_ID = process.env.NOTIFICATION_SHEET_ID;
    const API_KEY  = process.env.NOTIFICATION_API_KEY;
    const RANGE    = "Sheet1!A2:C"; // تأكدي اسم الشيت

    if (!SHEET_ID || !API_KEY) {
      return res.status(500).json({ error: "SHEET_ID أو API_KEY غير موجود" });
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Google Sheets API Error:", text);
      return res.status(500).json({ error: "فشل جلب الإشعارات من Sheets" });
    }

    const data = await response.json();

    // خليه يجيب كل الرسائل سواء TRUE أو FALSE ويشيل المسافات
    // const messages = (data.values || []).map(row => row[1].trim());
const messages = (data.values || [])
  .filter(row => row[2] === "TRUE")   // هات اللي مفعّل بس
  .map(row => row[1])                 // نص الرسالة
  .filter(Boolean)
  .map(text => text.trim());

    res.status(200).json({ messages });

  } catch (err) {
    console.error("API Route Error:", err);
    res.status(500).json({ error: "حدث خطأ داخلي في الـ API" });
  }
}

