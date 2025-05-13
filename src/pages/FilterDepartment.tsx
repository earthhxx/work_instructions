import { useEffect, useState } from "react";
import axios from "axios";

interface DocumentType {
  id: number;
  W_Dep: string;
  W_Process: string;
  W_Revision: string;
  W_DocName: string;
  W_name: string;
  W_PDFs: string;
}

const App = () => {
  const [data, setData] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDep, setSelectedDep] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // สำหรับการค้นหา

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/ShowResult");
        console.log("data", res);
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allDeps = Array.from(new Set(data.map((d) => d.W_Dep).filter(Boolean)));
  const allProcesses = Array.from(new Set(data.map((d) => d.W_Process).filter(Boolean)));

  const filteredData = data.filter((d) => {
    const matchDep = selectedDep ? d.W_Dep === selectedDep : true;
    const matchProc = selectedProcess ? d.W_Process === selectedProcess : true;
    const matchSearchTerm =
      d.W_Dep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.W_Process.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDep && matchProc && matchSearchTerm; // ฟิลเตอร์ด้วย searchTerm
  });

  const handleShowPdf = (PDFPATH: string) => {
    const url = `http://192.168.130.240:5006/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
    console.log(url)
    setPdfUrl(url); // ตั้งค่า URL ของ PDF
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">🔍 Filter by Department & Process</h1>

      {/* Search Bar */}
      <div className="w-full max-w-xl mb-8">
        <input
          type="text"
          placeholder="Search by Department or Process..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 text-lg text-gray-900 rounded-xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
        {/* Department */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Department</h2>
          <div className="flex flex-wrap gap-3">
            {allDeps.map((dep) => (
              <button
                key={dep}
                onClick={() => setSelectedDep(dep === selectedDep ? null : dep)}
                className={`px-5 py-2 rounded-full font-medium transition ${selectedDep === dep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900 hover:bg-blue-400 hover:text-white"
                  }`}
              >
                {dep}
              </button>
            ))}
          </div>
        </div>

        {/* Process */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Process</h2>
          <div className="flex flex-wrap gap-3">
            {allProcesses.map((proc) => (
              <button
                key={proc}
                onClick={() => setSelectedProcess(proc === selectedProcess ? null : proc)}
                className={`px-5 py-2 rounded-full font-medium transition ${selectedProcess === proc
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-900 hover:bg-green-400 hover:text-white"
                  }`}
              >
                {proc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedDep || selectedProcess || searchTerm) && (
        <button
          onClick={() => {
            setSelectedDep(null);
            setSelectedProcess(null);
            setSearchTerm(""); // ล้างค่า searchTerm
          }}
          className="mb-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
        >
          ❌ Clear Filters
        </button>
      )}

      {/* Filtered Results */}
      <div className="flex flex-col items-center justify-center w-full px-4">
        <h2 className="text-xl mb-4">
          Showing <span className="font-bold">{filteredData.length}</span> result(s)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white text-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col"
              onClick={() => handleShowPdf(item.W_PDFs)}
            >
              <div className="flex-1">
                {[{ label: "W_Dep", value: item.W_Dep },
                { label: "W_Process", value: item.W_Process },
                { label: "W_name", value: item.W_name },
                { label: "W_DocName", value: item.W_DocName },
                { label: "W_Revision", value: item.W_Revision },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1">
                    <span className="font-medium text-gray-600">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('onclick',item.W_PDFs); // ป้องกัน trigger ซ้ำจาก onClick ที่ parent div
                  handleShowPdf(item.W_PDFs);
                }}
                className="mt-4 px-4 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-600"
              >
                View PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer */}
      {pdfUrl && (
        <div className=" fixed mt-8 w-full max-w-4xl">
          <h3 className="text-lg font-bold mb-4 text-center">🔎 PDF Viewer</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div 
            onClick={() => setPdfUrl(null)}
            className="fixed flex justify-center items-center size-18 m-4 p-4 text-4xl bg-red-700 rounded-full">
            x</div>
            <iframe
              src={pdfUrl}
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
