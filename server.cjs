const express = require('express');
const app = express();
const port = 3010;
const cors = require('cors');
app.use(cors());


// Mock data
const documents = [
  {
    id: 10,
    W_NumberID: "SD-PD-03",
    W_Revision: "00",
    W_DocName: "ขั้นตอนการจัดการเมื่อ AOI ตรวจพบ NG",
    W_Dep: "PRO",
    W_Process: "AOI",
    W_PDFs: "\\\\server\\docs\\aoi-ng.pdf",
    W_name: "Chittakorn Bangyeekhon",
    Datetime: "2025-05-09 09:00:38.893"
  },
  {
    id: 11,
    W_NumberID: "SD-EN-01",
    W_Revision: "01",
    W_DocName: "Engineering Spec",
    W_Dep: "EN",
    W_Process: "Design",
    W_PDFs: "\\\\server\\docs\\en-spec.pdf",
    W_name: "Nattapong",
    Datetime: "2025-05-10 10:10:10"
  },
  {
    id: 12,
    W_NumberID: "SD-QA-01",
    W_Revision: "01",
    W_DocName: "Quality Control Guideline",
    W_Dep: "QA",
    W_Process: "Inspection",
    W_PDFs: "\\\\server\\docs\\qa-guide.pdf",
    W_name: "Supansa",
    Datetime: "2025-05-10 11:00:00"
  },
  {
    id: 13,
    W_NumberID: "SD-WH-01",
    W_Revision: "01",
    W_DocName: "Warehouse SOP",
    W_Dep: "WH",
    W_Process: "Storage",
    W_PDFs: "\\\\server\\docs\\wh-sop.pdf",
    W_name: "Kittichai",
    Datetime: "2025-05-10 12:00:00"
  },
  {
    id: 14,
    W_NumberID: "SD-EN-02",
    W_Revision: "02",
    W_DocName: "PCB Layout Guideline",
    W_Dep: "EN",
    W_Process: "Layout",
    W_PDFs: "\\\\server\\docs\\pcb-layout.pdf",
    W_name: "Prapaporn",
    Datetime: "2025-05-11 08:30:00"
  },
  {
    id: 15,
    W_NumberID: "SD-PRO-04",
    W_Revision: "03",
    W_DocName: "Reflow Oven Setup",
    W_Dep: "PRO",
    W_Process: "Reflow",
    W_PDFs: "\\\\server\\docs\\reflow-setup.pdf",
    W_name: "Anan",
    Datetime: "2025-05-11 09:00:00"
  },
  {
    id: 16,
    W_NumberID: "SD-QA-02",
    W_Revision: "01",
    W_DocName: "Final QA Checklist",
    W_Dep: "QA",
    W_Process: "Final Check",
    W_PDFs: "\\\\server\\docs\\qa-final-check.pdf",
    W_name: "Rachada",
    Datetime: "2025-05-11 14:15:00"
  },
  {
    id: 17,
    W_NumberID: "SD-WH-02",
    W_Revision: "02",
    W_DocName: "Raw Material Receiving",
    W_Dep: "WH",
    W_Process: "Receiving",
    W_PDFs: "\\\\server\\docs\\wh-receive.pdf",
    W_name: "Sarun",
    Datetime: "2025-05-11 15:00:00"
  },
  {
    id: 18,
    W_NumberID: "SD-EN-03",
    W_Revision: "01",
    W_DocName: "Component Selection Rules",
    W_Dep: "EN",
    W_Process: "Component",
    W_PDFs: "\\\\server\\docs\\component-rules.pdf",
    W_name: "Warunee",
    Datetime: "2025-05-12 09:45:00"
  },
  {
    id: 19,
    W_NumberID: "SD-PRO-05",
    W_Revision: "01",
    W_DocName: "SMT Line Operation",
    W_Dep: "PRO",
    W_Process: "SMT",
    W_PDFs: "\\\\server\\docs\\smt-line.pdf",
    W_name: "Phumin",
    Datetime: "2025-05-12 10:20:00"
  }
];

// Endpoint: /api/documents?dept=EN
app.get('/api/documents', (req, res) => {
  const { dept } = req.query;

  if (dept) {
    const filtered = documents.filter(doc => doc.W_Dep.toLowerCase() === dept.toLowerCase());
    return res.json(filtered);
  }

  res.json(documents);
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});
