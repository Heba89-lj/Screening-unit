export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";
  req.on("data", chunk => body += chunk.toString());

  req.on("end", async () => {
    try {
      const { question } = JSON.parse(body);
      if (!question) {
        return res.json({ answer: "اكتب سؤالك أولاً" });
      }

      const sheetId = process.env.FAQ_SHEET_ID;
      const apiKey = process.env.FAQ_API_KEY;

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) {
        return res.json({ answer: "لا توجد بيانات" });
      }

      const rows = data.values.slice(1);

      const found = rows.find(row =>
        question.includes(row[0])
      );

      res.json({
        answer: found ? found[1] : "من فضلك راجع السؤال أو تواصل مع الدعم"
      });

    } catch (err) {
      res.status(500).json({ answer: "حدث خطأ في السيرفر" });
    }
  });
}