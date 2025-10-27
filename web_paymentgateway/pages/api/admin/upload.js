// 📄 /pages/api/admin/upload.js
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const uploadDir = path.join(process.cwd(), "/public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const file = files.file?.[0] || files.file;
    if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const filename = path.basename(file.filepath);
    const fileUrl = `/uploads/${filename}`;

    return res.status(200).json({ success: true, url: fileUrl });
  });
}
