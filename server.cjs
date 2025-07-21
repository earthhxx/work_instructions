//server.cjs
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const sql = require("mssql");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const { convert } = require("pdf-poppler");  // ใช้ convert ไม่ใช่ PdfConverter

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
const poolCache = {};

async function getDbPool(dbName) {
  const config = dbConfigs[dbName];
  if (!config) throw new Error(`Invalid database name: ${dbName}`);

  if (poolCache[dbName]?.connected) {
    return poolCache[dbName];
  }

  const pool = new sql.ConnectionPool(config);
  poolCache[dbName] = await pool.connect();
  return poolCache[dbName];
}

async function runQueryOnDb1(query, inputs = []) {
  const pool = await getDbPool("db1");
  const request = pool.request();

  for (const input of inputs) {
    request.input(input.name, input.type, input.value);
  }

  const result = await request.query(query);
  return result.recordset;
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



// Create CTE and join WI Table for NumID => lastRevision
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




// API: Get all WORKINSTRUCTION 
app.get("/api/distinct-dep-proc", async (req, res) => {
  const query = `
    SELECT DISTINCT [W_Dep], [W_Process]
    FROM [DASHBOARD].[dbo].[WORKINSTRUCTION]
    ORDER BY [W_Dep], [W_Process]
  `;
  try {
    const data = await runQueryOnDb1(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching distinct departments & processes:", error);
    res.status(500).send("Internal Server Error");
  }
});


// API: Serve PDF file inline if path allowed

app.get("/api/open-pdf", async (req, res) => {
  console.log("🚀 [GET] /api/open-pdf called");
  const filePath = req.query.path;

  const allowedRoots = [
    "\\\\192.168.120.9\\DataDocument",
    "\\\\192.168.120.9\\DataPartList",
  ];

  console.log("filePath:", filePath);
  console.log("AllowedRoots:", allowedRoots);
  console.log("Resolved filePath:", path.resolve(filePath));

  if (
    !filePath ||
    !allowedRoots.some((root) =>
      path.resolve(filePath).startsWith(path.resolve(root))
    )
  ) {
    console.log("Access denied for path:", filePath);
    return res.status(403).send("Access denied");
  }

  try {
    const outputDir = path.join(__dirname, "temp_pngs");
    await fs.mkdir(outputDir, { recursive: true });

    const options = {
      format: "png",
      out_dir: outputDir,
      out_prefix: "output",
      page: null,
      dpi:500,
    };

    console.log("Converting PDF...");
    await convert(filePath, options);
    console.log("Conversion complete.");

    const outputFile = path.join(outputDir, "output-1.png");
    const imageBuffer = await fs.readFile(outputFile);
    console.log("Sending PNG back.");

    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);

    setTimeout(() => {
      fs.unlink(outputFile).catch(console.error);
    }, 10000);
  } catch (error) {
    console.error("❌ Error converting PDF:", error);
    res.status(500).send("Error converting PDF to PNG");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});