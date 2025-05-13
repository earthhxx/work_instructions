import { useEffect, useState } from "react";
import axios from "axios";

interface DocumentType {
  id: number;
  W_NumberID: string;
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/ShowResult");
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
    return matchDep && matchProc && matchSearchTerm;
  });

  const handleShowPdf = (PDFPATH: string) => {
    const url = `http://192.168.130.240:5006/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
    setPdfUrl(url);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center px-4">
      <div className="rerative ">
        <div className="absolute top-2 right-0 me-2">
          <img src="/public/images/LOGO.png" alt="Logo" className="h-25 w-auto mt-2" />
        </div>

      </div>

      {/* Process Filter */}
      <div className="w-full mb-6 mt-6">
        {/* <label htmlFor="process-select" className="block text-lg font-semibold mb-2 mt-8">
          Process:
        </label> */}
        <select
          id="process-select"
          value={selectedProcess || ""}
          onChange={(e) =>
            setSelectedProcess(e.target.value === "" ? null : e.target.value)
          }
          className="w-full md:w-64 px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">-- All Processes --</option>
          {allProcesses.map((proc) => (
            <option key={proc} value={proc}>
              {proc}
            </option>
          ))}
        </select>
      </div>


      {/* Clear Filters */}
      {(selectedDep || selectedProcess || searchTerm) && (
        <div className="flex w-full justify-start items-center mb-4">
          <button
            onClick={() => {
              setSelectedDep(null);
              setSelectedProcess(null);
              setSearchTerm("");
            }}
            className="px-5 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-full"
          >
            ❌ Clear Filters
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-start w-full mb-6">
        <div className="w-full max-w-xl">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 text-lg text-gray-800 rounded-xl bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm lg:text-xl text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2">รหัสเอกสาร</th>
              <th className="border border-gray-200 px-4 py-2">ชื่อเอกสาร</th>
              <th className="border border-gray-200 px-4 py-2">รีวิชั่น</th>
              <th className="border border-gray-200 px-4 py-2">PDF File</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">{item.W_NumberID}</td>
                <td className="border border-gray-200 px-4 py-2">{item.W_DocName}</td>
                <td className="border border-gray-200 px-4 py-2">{item.W_Revision}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowPdf(item.W_PDFs);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Viewer */}
      {pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[90vw] h-[90vh] relative bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-50"
              onClick={() => setPdfUrl(null)}
            >
              ❌ ปิด PDF
            </button>
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
