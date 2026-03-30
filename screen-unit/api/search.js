



export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { number, year, nationalId } = req.query;

  if (!number || !year || !nationalId) {
    return res.status(400).json({
      success: false,
      message: "ادخل رقم الفحص والسنة والرقم القومي أو جواز السفر",
    });
  }

  const normalize = (str = "") =>
    str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
       .replace(/\s+/g, "")
       .trim();

  const num = normalize(number);
  const yr = normalize(year);
  
  // 🔥 أهم تعديل هنا — نجبر المدخل يكون Uppercase
  const nid = normalize(nationalId).toUpperCase();

  const sheetId = process.env.SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
    const response = await fetch(url);
    const rawText = await response.text();

    let data;
    try { data = JSON.parse(rawText); }
    catch {
      return res.status(500).json({
        success: false,
        message: "رد غير صالح من Google Sheets",
      });
    }

    if (!response.ok || data.error) {
      return res.status(500).json({
        success: false,
        message: "خطأ في الوصول إلى Google Sheet",
      });
    }

    const rows = data.values?.slice(1) || [];

    const match = rows.find((r) => {
      const sheetNumber = normalize(r[0]);
      const sheetYear = normalize(r[1]);
      
      // 🔥 وهنا كمان نحول القيمة اللي في الشيت إلى Uppercase
      const sheetIdValue = normalize(r[2] || "").toUpperCase();

      return (
        sheetNumber === num &&
        sheetYear === yr &&
        sheetIdValue.includes(nid) // مقارنة بدون كابيتال/سمول
      );
    });

    if (match) {
      return res.status(200).json({
        success: true,
        result: {
          number: match[0],
          year: match[1],
           nationalId:  match[2],
          caseNumber: match[3],
          applicant: match[4],
          status: match[5],
          visa: match[6],
          notes: match[7],
           hasNotes: match[9],              // عمود "وجود ملاحظات"
      publicProsecution: match[10],    // مطالبات نائب عام
      justiceRequests: match[11],      // مطالبات وزارة العدل
      taxes: match[12],                // ضرائب
      courtExecution: match[13],       // تنفيذ أحكام
        mix: match[14],
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: "لم يتم العثور على بيانات مطابقة",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في السيرفر",
      error: error.message,
    });
  }
}



