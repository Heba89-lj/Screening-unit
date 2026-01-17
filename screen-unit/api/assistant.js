function normalizeArabic(text) {
  return text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْ]/g, "")          // إزالة التشكيل
    .replace(/^ال/g, "")                // إزالة ال التعريف
    .replace(/(ات|ون|ين|ة|ه|ي)$/g, "")  // جمع ونهايات
    .replace(/[^ء-ي\s]/g, "")           // إزالة أي رموز
   .replace(/[أإآ]/g, "ا")

    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = "";
  req.on("data", chunk => body += chunk.toString());
  req.on("end", async () => {
    try {
      const { question } = JSON.parse(body);
      if (!question) return res.json({ answer: "اكتب سؤالك أولاً" });

      const sheetId = process.env.FAQ_SHEET_ID;
      const apiKey = process.env.FAQ_API_KEY;

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) return res.json({ answer: "لا توجد بيانات" });

      const rows = data.values.slice(1); // تخطي العنوان
      const userText = normalizeArabic(question);

      let foundAnswer = null;

      rows.some(row => {
        const keywords = row[0].split("-").map(k => normalizeArabic(k));
        const answer = row[1];

        // أي كلمة مفتاحية مطابقة تكفي
        const matched = keywords.some(k => userText.includes(k));
        if (matched) {
          foundAnswer = answer.trim();
          return true;
        }
      });

      res.json({ answer: foundAnswer || "من فضلك ممكن توضيح" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ answer: "حدث خطأ في السيرفر" });
    }
  });
}

