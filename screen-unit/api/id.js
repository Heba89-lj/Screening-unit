
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "الرقم القومي مطلوب" });
  }

  const normalize = (str = "") =>
    str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).trim();

  const nationalId = normalize(id);
  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({ success: false, message: "فشل الوصول إلى Google Sheet" });
    }

    const rows = data.values?.slice(1) || [];

    // ✅ البحث عن كل الصفوف اللي تحتوي نفس الرقم القومي
    const matches = rows.filter(r => normalize(r[2] || "").includes(nationalId));

    if (matches.length > 0) {
      const results = matches.map(r => ({
        number: r[0] || "-",
        year: r[1] || "-",
        applicant: r[4] || "-"
      }));
      return res.status(200).json({ success: true, results });
    } else {
      return res.status(200).json({ success: true, results: [] });
    }

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
  }
}
