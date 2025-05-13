const express = require("express");
const multer = require("multer");
const sql = require("mssql");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

// Network path (ต้องแน่ใจว่า server เข้าถึงได้)
const networkPath = "\\\\192.168.120.6\\02 Department\\10 Sharing Center\\05 IT\\Document";

const app = express();
app.use(cors());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "uploads");
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// ตั้งค่า Multer สำหรับอัปโหลดไฟล์
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      console.log("Rejected file:", file.originalname);
      return cb(null, false);
    }
    cb(null, true);
  },
});

// การตั้งค่าฐานข้อมูล
const dbConfig1 = {
  user: "sa",
  password: "B1mUmNU9",
  server: "192.168.120.9",
  database: "DASHBOARD",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const dbConfig2 = {
  user: "sa",
  password: "B1mUmNU9",
  server: "192.168.120.2",
  database: "NewFCXT(IM Thailand)",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ฟังก์ชันเลือก Database และปิดการเชื่อมต่อหลังใช้งาน
async function getDatabaseConnection(dbName) {
  const config = dbName === "db1" ? dbConfig1 : dbConfig2;
  try {
    await sql.connect(config);
  } catch (error) {
    throw new Error("เชื่อมต่อฐานข้อมูลล้มเหลว: " + error.message);
  }
}

// 🟢 API สำหรับดึงข้อมูลพนักงานจากฐานข้อมูล
app.get("/api/get-employee/:id", async (req, res) => {
  try {
    const empId = req.params.id;
    console.log("📥 Fetching employee ID:", empId);
    await getDatabaseConnection("db2"); // ใช้ db2
    console.log("✅ Connected to DB2");

    const result = await sql.query`SELECT [Name] FROM [tb_Employee] WHERE [Label] = ${empId}`;

    if (result.recordset.length > 0) {
      res.json({ name: result.recordset[0].Name });
    } else {
      res.status(404).json({ error: "ไม่พบข้อมูลพนักงาน" });
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    await sql.close(); // ปิดการเชื่อมต่อ
  }
});


// ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''API for Insert''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
app.post("/api/insert/:dbName", upload.single("file"), async (req, res) => {
  let dbName = req.params.dbName;

  if (!["db1", "db2"].includes(dbName)) {
    return res.status(400).json({ error: "ชื่อฐานข้อมูลไม่ถูกต้อง (ต้องเป็น db1 หรือ db2)" });
  }

  try {
    console.log(`📌 Connecting to ${dbName}`);
    await getDatabaseConnection(dbName);

    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ PDF" });
    }

    const { text2, text3, text4, text5, text6, text7 } = req.body;

    // สร้างชื่อไฟล์ใหม่ที่ปลอดภัย เช่น "DOC1234_R1.pdf"
    const safeFileName = `${text3.trim()}-${text4.trim()} ${text5.trim()}.pdf`;
    const savePath = path.join(networkPath, safeFileName);

    // คัดลอกไฟล์ที่อัปโหลดไปยัง network path
    await fs.copyFile(req.file.path, savePath);

    // ลบไฟล์ temp หลังใช้งาน
    await fs.unlink(req.file.path);

    const query = `
      INSERT INTO WORKINSTRUCTION ([W_NumberID],[W_Revision],[W_DocName],[W_Dep],[W_Process],[W_PDFs],[W_name],[Datetime])
      VALUES (@text3, @text4, @text5,@text6, @text7, @fileName, @text2, GETDATE())
    `;

    const request = new sql.Request();
    request.input("text3", sql.NVarChar(255), text3);
    request.input("text4", sql.NVarChar(255), text4);
    request.input("text5", sql.NVarChar(255), text5);
    request.input("text6", sql.NVarChar(255), text6);
    request.input("text7", sql.NVarChar(255), text7);
    request.input("text2", sql.NVarChar(255), text2);
    const fullPath = `\\\\192.168.120.6\\02 Department\\10 Sharing Center\\05 IT\\Document\\${safeFileName}`;
    request.input("fileName", sql.NVarChar(255), fullPath);

    await request.query(query);
    res.status(200).json({ message: `บันทึกข้อมูลและไฟล์สำเร็จ!` });

  } catch (error) {
    console.error("❌ Error while saving data:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    await sql.close();
  }
});


// select list Process
app.get('/api/Process', async (req, res) => {
  try {
    await getDatabaseConnection("db1");
    const result = await sql.query(
      'SELECT distinct [W_Process] FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]'
    );
    // ส่งข้อมูลกลับ frontend
    res.json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).send('Error fetching data');
  } finally {
    await sql.close();
  }
});


// Select show result document

app.get('/api/ShowResult', async (req, res) => {
  try {
    await getDatabaseConnection("db1");

    const result = await sql.query(`
      WITH RankedDocs AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY W_NumberID ORDER BY Datetime DESC) AS rn
    FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
)
SELECT [id],
       [W_NumberID],
       [W_Revision],
       [W_DocName],
       [W_Dep],
       [W_Process],
       [W_PDFs],
       [W_name],
       [Datetime]
FROM RankedDocs
WHERE rn = 1
ORDER BY W_NumberID 
    `);

    // ส่งข้อมูลกลับ frontend
    res.json(result.recordset);

  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).send('Error fetching data');
  } finally {
    await sql.close();
  }
});

// ค้นหา file PDF
app.get("/api/open-pdf", async (req, res) => {
  const filePath = req.query.path;

  const allowedRoot = "\\\\192.168.120.6\\02 Department\\10 Sharing Center\\05 IT\\Document";
  if (!filePath || !filePath.startsWith(allowedRoot)) {
    return res.status(403).send("Access denied");
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=document.pdf");
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error opening PDF:", error);
    res.status(500).send("Error reading file");
  }
});



// Start Server
app.listen(5006, () => {
  console.log("Server is running on port 5006");
});
