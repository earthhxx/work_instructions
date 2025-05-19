import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";


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

const LOCAL_STORAGE_KEY = "selectedDepartment";
const LOCAL_STORAGE_KEY2 = "selectedProcess"

const App = () => {
  const [data, setData] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // ...states เดิม
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    () => localStorage.getItem(LOCAL_STORAGE_KEY) || null
  );
  const [selectedProcess, setSelectedProcess] = useState<string | null>(
    () => localStorage.getItem(LOCAL_STORAGE_KEY2) || null
  );

  // sync localStorage for department & process
  useEffect(() => {
    if (selectedDepartment) localStorage.setItem(LOCAL_STORAGE_KEY, selectedDepartment);
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedProcess) localStorage.setItem(LOCAL_STORAGE_KEY2, selectedProcess);
    console.log('use',selectedProcess);
  }, [selectedProcess]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/ShowResult");
        console.log(res);
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
        console.log(loading);
      }
    };
    fetchData();
  }, []);

  const handleShowPdf = (PDFPATH: string) => {
    const url = `http://192.168.130.240:5009/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
    setPdfUrl(url);
  };

  const custom_NumderID = ['WI', 'FM', 'SD', 'QP', 'QM'];
  const [selectedNumberID, setSelectedNumberID] = useState<string | null>(null);


  const allProcesses = Array.from(
    new Set(
      data
        .filter((d) => !selectedDepartment || d.W_Dep === selectedDepartment)
        .map((d) => d.W_Process)
        .filter(Boolean)
    )
  );
  // const allNumberID = Array.from(new Set(data.map((d) => d.W_NumberID).filter(Boolean)));


  // filteredData ถ้าต้องกรอง process ด้วย ก็เอา selectedProcess มารวม
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      const matchDep = selectedDepartment ? d.W_Dep === selectedDepartment : true;
      const matchProc = selectedProcess ? d.W_Process === selectedProcess : true;
      // ...เงื่อนไขอื่น ๆ
      const matchNumberID = selectedNumberID ? d.W_NumberID.includes(selectedNumberID) : true;
      const matchSearchTerm =
        d.W_Dep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_Process.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_NumberID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_DocName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDep && matchProc && matchSearchTerm && matchNumberID;
    });
  }, [data, selectedDepartment, selectedProcess, searchTerm, selectedNumberID]);



  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center px-4">
      <div className="rerative ">
        <div className="lg:absolute top-2 right-0 me-2 ">
          <img src="/public/images/LOGO.png" alt="Logo" className="h-15 lg:h-20 lg:w-[300px] xl:auto mt-4" />
        </div>
      </div>


      {/* Process Filter */}
      <div className="w-full mb-4 mt-2">
        <div className="flex justify-center mt-4">
          <h1 className="w-full lg:w-xl text-center text-3xl font-bold mb-6">🔍 ค้นหา เอกสารสำหรับกระบวนการทำงาน</h1>
        </div>
        {/* <label htmlFor="process-select" className="block text-lg font-semibold mb-2 mt-8">
          Process:
        </label> */}
        <div className="flex flex-col gap-4">
          <div className="flex w-full gap-4 items-center justify-center-safe lg:justify-start">
            <div className="w-[25%] lg:w-0"></div>
            <div className="w-[50%] lg:w-[30%]">
              <select
                id="process-select"
                value={selectedProcess || ""}
                onChange={(e) =>
                  setSelectedProcess(e.target.value === "" ? null : e.target.value)
                }
                className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value={selectedProcess || ""}>{selectedProcess}</option>
                {allProcesses.map((proc) => (
                  <option key={proc} value={proc}>
                    {proc}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[25%] lg:w-[10%]"> {/* Clear Filters */}
              {(selectedProcess || searchTerm) && (
                <div className="flex w-full justify-center items-center">
                  <button
                    onClick={() => {
                      setSelectedProcess(null);
                      setSearchTerm("");
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-full"
                  >
                    ❌ Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      {selectedProcess && (() => {
        const filteredNumIDs = custom_NumderID.filter((numid) =>
          data.some((d) => d.W_NumberID.includes(numid) && d.W_Process === selectedProcess)
        );
        return filteredNumIDs.length > 0 ? (
          <div className="flex w-full justify-center items-center lg:justify-start lg:items-start gap-4">
            {filteredNumIDs.map((numid) => {
              const isSelected = selectedNumberID === numid;

              return (
                <button
                  key={numid}
                  type="button"
                  onClick={() => setSelectedNumberID(isSelected ? null : numid)}
                  aria-pressed={isSelected}
                  className={`w-[8%] lg:w-[5%] py-3 px-4 rounded-2xl border text-sm text-center font-medium transition-all duration-200 ease-in-out
              ${isSelected
                      ? "bg-blue-900 text-white shadow-md ring-2 ring-blue-300"
                      : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                    }`}
                >
                  {numid}
                </button>
              );
            })}
          </div>
        ) : null;
      })()}

      {/* Search Bar */}
      <div className="flex items-center justify-start w-full my-4">
        <div className="w-full lg:w-[40%]">
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
        <table className="w-full border-collapse text-[14px] lg:text-xl text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2">รหัสเอกสาร</th>
              <th className="border border-gray-200 px-4 py-2">ชื่อเอกสาร</th>
              {/* <th className="border border-gray-200 px-4 py-2">revision</th> */}
              <th className="border border-gray-200 px-4 py-2">PDF File</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="w-[20%] lg:w-[10%] border border-gray-200 px-4 py-2">{item.W_NumberID}</td>
                <td className="border border-gray-200 px-4 py-2">{item.W_DocName}</td>
                {/* <td className="border border-gray-200 px-4 py-2">{item.W_Revision}</td> */}
                <td className="text-center w-[20%] lg:w-[8%] border border-gray-200 px-4 py-2">
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
        <div className="fixed h-full w-full bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
          <div className="w-full h-full relative bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-50"
              onClick={() => setPdfUrl(null)}
            >
              ❌ ปิด PDF
            </button>
            <Worker workerUrl="/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={1.0}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
