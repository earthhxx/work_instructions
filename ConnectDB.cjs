require("dotenv").config();
const express = require("express");
const multer = require("multer");
const sql = require("mssql");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies if needed

const PORT = process.env.PORT || 5009;
const networkPath = process.env.NETWORK_PATH;
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");

// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// Multer setup: accept only PDFs
const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  },
});

// Database configurations
const dbConfigs = {
  db1: {
    user: process.env.DB1_USER,
    password: process.env.DB1_PASSWORD,
    server: process.env.DB1_SERVER,
    database: process.env.DB1_DATABASE,
    options: { encrypt: false, trustServerCertificate: true },
  },
  db2: {
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    server: process.env.DB2_SERVER,
    database: process.env.DB2_DATABASE,
    options: { encrypt: false, trustServerCertificate: true },
  },
};

// Create and return new connection pool for a given db name
async function getDbPool(dbName) {
  const config = dbConfigs[dbName];
  if (!config) throw new Error(`Invalid database name: ${dbName}`);

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  return pool;
}

//new 120-2
app.get('/api/120-2/scan-to-db-120-2', async (req, res) => {
  const productOrderNo = req.query.productOrderNo;

  if (!productOrderNo) {
    return res.status(400).json({ success: false, message: 'Missing productOrderNo' });
  }

  try {
    const pool = await getDbPool("db2");

    // 🧪 DEBUG DB name
    const dbNameResult = await pool.request().query('SELECT DB_NAME() AS dbName');
    console.log('📌 Connected to DB:', dbNameResult.recordset[0].dbName);

    // ✅ ตรวจสอบว่า table มีจริงไหม
    const tableCheck = await pool.request().query(`
      SELECT TOP 1 * 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'tb_ProductOrders'
    `);

    console.log('📌 Table exists:', tableCheck.recordset.length > 0);

    const result = await pool.request()
      .input('productOrderNo', sql.NVarChar, productOrderNo)
      .query(`
        SELECT productOrderNo, productName, ProcessLine 
        FROM [NewFCXT(IM Thailand)].[dbo].[tb_ProductOrders] 
        WHERE productOrderNo = @productOrderNo
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error('❌ DB Error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

//new 120-9
app.get('/api/120-9/Partlist', async (req, res) => {
  const line = req.query.line;
  const model = req.query.model;

  if (!line && !model) {
    return res.status(400).json({ success: false, message: 'Missing line || model' });
  }

  try {
    const pool = await getDbPool("db1");

    const result = await pool.request()
      .input('line', sql.NVarChar, line)
      .input('model', sql.NVarChar, model)
      .query(`
        SELECT TOP 1 
            [id],
            [PL_Line],
            [PL_Id],
            [PL_ModelName],
            [PL_Rev],
            [PL_PDF],
            [PL_User],
            [Datetime]
        FROM [DASHBOARD].[dbo].[PARTLIST]
        WHERE [PL_Line] = @line 
          AND [PL_ModelName] = @model
        ORDER BY [Datetime] DESC;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('❌ DB Error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// API: Get employee name by id (db2)
app.get("/api/get-employee/:id", async (req, res) => {
  const empId = req.params.id;
  let pool;
  try {
    pool = await getDbPool("db2");
    const result = await pool
      .request()
      .input("empId", sql.NVarChar, empId)
      .query("SELECT [Name] FROM [tb_Employee] WHERE [Label] = @empId");

    if (result.recordset.length) {
      res.json({ name: result.recordset[0].Name });
    } else {
      res.status(404).json({ error: "ไม่พบข้อมูลพนักงาน" });
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    pool?.close();
  }
});

// API: Insert record and save PDF file to network path
app.post("/api/insert/:dbName", upload.single("file"), async (req, res) => {
  const dbName = req.params.dbName;
  if (!["db1", "db2"].includes(dbName)) {
    return res.status(400).json({ error: "ชื่อฐานข้อมูลไม่ถูกต้อง (ต้องเป็น db1 หรือ db2)" });
  }

  let pool;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ PDF" });
    }

    const { text2, text3, text4, text5, text6, text7 } = req.body;
    if (!text3 || !text4 || !text5) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" });
    }

    // Compose safe filename
    const safeFileName = `${text3.trim()}-${text4.trim()} ${text5.trim()}.pdf`;
    const savePath = path.join(networkPath, safeFileName);

    // Copy uploaded file to network path, then delete temp file
    await fs.copyFile(req.file.path, savePath);
    await fs.unlink(req.file.path);

    pool = await getDbPool(dbName);
    const request = pool.request();
    request.input("text3", sql.NVarChar(255), text3);
    request.input("text4", sql.NVarChar(255), text4);
    request.input("text5", sql.NVarChar(255), text5);
    request.input("text6", sql.NVarChar(255), text6);
    request.input("text7", sql.NVarChar(255), text7);
    request.input("text2", sql.NVarChar(255), text2);
    // Use full UNC path for file
    const fullPath = path.join(networkPath, safeFileName).replace(/\//g, "\\");
    request.input("fileName", sql.NVarChar(255), fullPath);

    const query = `
      INSERT INTO WORKINSTRUCTION 
        ([W_NumberID], [W_Revision], [W_DocName], [W_Dep], [W_Process], [W_PDFs], [W_name], [Datetime])
      VALUES 
        (@text3, @text4, @text5, @text6, @text7, @fileName, @text2, GETDATE())
    `;

    await request.query(query);

    res.status(200).json({ message: "บันทึกข้อมูลและไฟล์สำเร็จ!" });
  } catch (error) {
    console.error("Error while saving data:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    pool?.close();
  }
});

// Helper for generic SELECT queries on db1
async function runQueryOnDb1(query, inputs = []) {
  const pool = await getDbPool("db1");
  try {
    const request = pool.request();
    for (const { name, type, value } of inputs) {
      request.input(name, type, value);
    }
    const result = await request.query(query);
    return result.recordset;
  } finally {
    pool.close();
  }
}

// API: Get all WORKINSTRUCTION entries ordered by datetime desc
app.get("/api/Result", async (req, res) => {
  const query = `
    SELECT [id], [W_NumberID], [W_Revision], [W_DocName], [W_Dep], [W_Process], [W_PDFs], [W_name], [Datetime]
    FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
    ORDER BY [Datetime] DESC
  `;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Result:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/api/Result/CteLatestRevisions", async (req, res) => {
  const query = `
            WITH LatestRevisions AS (
            SELECT 
                [W_NumberID],
                MAX([W_Revision]) AS MaxRevision
            FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
            GROUP BY [W_NumberID]
        )

          SELECT 
              w.[id],w.[W_NumberID], 
              w.[W_Revision], 
              w.[W_DocName], 
              w.[W_Dep], 
              w.[W_Process], 
              w.[W_PDFs], 
              w.[W_name], 
              w.[Datetime]
          FROM [DASHBOARD].[dbo].[WORKINSTRUCTION] w
          INNER JOIN LatestRevisions lr ON 
              w.[W_NumberID] = lr.[W_NumberID] AND 
              w.[W_Revision] = lr.[MaxRevision]
          ORDER BY w.[W_NumberID], w.[W_Revision]
  `;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Result:", error);
    res.status(500).send("Error fetching data");
  }
});

// API: Get distinct processes
app.get("/api/Process", async (req, res) => {
  const query = `SELECT DISTINCT [W_Process] FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]`;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Process:", error);
    res.status(500).send("Error fetching data");
  }
});

// API: Get distinct departments
app.get("/api/Department", async (req, res) => {
  const query = `SELECT DISTINCT [W_Dep] FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]`;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Department:", error);
    res.status(500).send("Error fetching data");
  }
});

// API: Get distinct processes by department
app.get("/api/ProcessByDep/:dep", async (req, res) => {
  const dep = req.params.dep;
  const query = `
    SELECT DISTINCT [W_Process]
    FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
    WHERE [W_Dep] = @dep
  `;
  try {
    const pool = await getDbPool("db1");
    const result = await pool.request()
      .input("dep", sql.NVarChar, dep)
      .query(query);

    res.json(result.recordset);
    pool.close();
  } catch (error) {
    console.error("Error fetching processes by department:", error);
    res.status(500).send("Error fetching data");
  }
});

// API: Get latest revision per W_NumberID
app.get("/api/ShowResult", async (req, res) => {
  const query = `
    WITH RankedDocs AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY W_NumberID ORDER BY Datetime DESC) AS rn
      FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
    )
    SELECT [id], [W_NumberID], [W_Revision], [W_DocName], [W_Dep], [W_Process], [W_PDFs], [W_name], [Datetime]
    FROM RankedDocs
    WHERE rn = 1
    ORDER BY W_NumberID
  `;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching ShowResult:", error);
    res.status(500).send("Error fetching data");
  }
});

// API: Serve PDF file inline if path allowed
app.get("/api/open-pdf", async (req, res) => {
  const filePath = req.query.path;

  // Whitelisted root directories
  const allowedRoots = [
    "\\\\192.168.120.9\\DataDocument",
    "\\\\192.168.120.9\\DataPartList"
  ];

  // Check if filePath is under allowed roots
  if (
    !filePath ||
    !allowedRoots.some((root) =>
      path.resolve(filePath).startsWith(path.resolve(root))
    )
  ) {
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

// API: Get latest revision for a given W_NumberID
app.get("/api/get-revision/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await getDbPool("db1");
    const result = await pool.request()
      .input("id", sql.NVarChar, id)
      .query(`
        SELECT TOP 1 W_Revision 
        FROM [WORKINSTRUCTION] 
        WHERE W_NumberID = @id 
        ORDER BY W_Revision DESC
      `);

    if (result.recordset.length) {
      res.json({ found: true, revision: result.recordset[0].W_Revision });
    } else {
      res.json({ found: false });
    }
    pool.close();
  } catch (error) {
    console.error("Error fetching revision:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Delete a record by id
app.delete("/api/delete/:id", async (req, res) => {
  const id = req.params.id;
  let pool;

  try {
    pool = await getDbPool("db1");

    // 1. หา path ของไฟล์ก่อน
    const selectResult = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT [W_PDFs] FROM [DASHBOARD].[dbo].[WORKINSTRUCTION] WHERE [id] = @id");

    if (selectResult.recordset.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    const filePath = selectResult.recordset[0].W_PDFs;

    // 2. ลบ record ออกจาก database
    const deleteResult = await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM [DASHBOARD].[dbo].[WORKINSTRUCTION] WHERE [id] = @id");

    // 3. ลบไฟล์ออกจากระบบไฟล์
    try {
      await fs.unlink(filePath);
      console.log(`ลบไฟล์สำเร็จ: ${filePath}`);
    } catch (fileErr) {
      console.warn(`ไม่สามารถลบไฟล์ได้ หรือไฟล์ไม่มีอยู่: ${filePath}`, fileErr.message);
    }

    res.json({ message: "ลบข้อมูลและไฟล์สำเร็จ" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  } finally {
    pool?.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});