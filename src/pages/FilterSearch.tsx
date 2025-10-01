import { useEffect, useMemo, useState } from "react";
import { Suspense, lazy } from 'react';

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

const LOCAL_STORAGE_KEY = "selectedDepartment";
const LOCAL_STORAGE_KEY2 = "selectedProcess";
const CUSTOM_NUMBER_IDS = ['WI', 'FM', 'SD', 'QP', 'QM'];
const LazyPdfViewer = lazy(() => import('../components/PdfViewer'));
// const LazyPdfIframe = lazy(() => import('./components/LazyPdfiFrame')); // Assuming this is the correct path for LazyPdfIframe

const App = () => {
  const [data, setData] = useState<DocumentType[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment] = useState<string | null>(
    () => localStorage.getItem(LOCAL_STORAGE_KEY) || null
  );
  const [selectedProcess, setSelectedProcess] = useState<string | null>(
    () => localStorage.getItem(LOCAL_STORAGE_KEY2) || null
  );
  const [selectedNumberID, setSelectedNumberID] = useState<string | null>(null);

  const fetchData = async () => {

    try {
      const res = await axios.get("/api/Result/CteLatestRevisions");
      setData(res.data);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    } finally {

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProcess) {
      localStorage.setItem(LOCAL_STORAGE_KEY2, selectedProcess);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY2);
    }
  }, [selectedProcess]);

  const allProcesses = useMemo(() => {
    return Array.from(new Set(data.filter(d => !selectedDepartment || d.W_Dep === selectedDepartment).map(d => d.W_Process).filter(Boolean)));
  }, [data, selectedDepartment]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchesDepartment = selectedDepartment ? d.W_Dep === selectedDepartment : true;
      const matchesProcess = selectedProcess ? d.W_Process === selectedProcess : true;
      const matchesNumberID = selectedNumberID ? d.W_NumberID.includes(selectedNumberID) : true;
      const matchesSearchTerm =
        d.W_Dep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_Process.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_NumberID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.W_DocName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDepartment && matchesProcess && matchesNumberID && matchesSearchTerm;
    });
  }, [data, selectedDepartment, selectedProcess, selectedNumberID, searchTerm]);

  const handleShowPdf = (PDFPATH: string) => {
    const url = `http://192.168.120.9:5009/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
    setPdfUrl(url);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center px-4">
      <div className="rerative ">
        <div className="lg:absolute top-2 right-0 me-2 ">
          <img src="/images/LOGO.png" alt="Logo" className="h-15 lg:h-20 lg:w-[300px] xl:auto mt-4" />
        </div>
      </div>

      <div className="w-full mb-4 mt-2">
        <div className="flex justify-center mt-4">
          <h1 className="w-full lg:w-xl text-center text-3xl font-bold mb-6">🔍 ค้นหา เอกสารสำหรับกระบวนการทำงาน</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex w-full gap-4 items-center justify-center-safe lg:justify-start">
            <div className="w-[25%] lg:w-0"></div>
            <div className="w-[50%] lg:w-[30%]">
              <select
                onFocus={() => fetchData()}
                id="process-select"
                value={selectedProcess || ""}
                onChange={(e) => setSelectedProcess(e.target.value === "" ? null : e.target.value)}
                className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value={""}>{selectedProcess || '--ALL PROCESS--'}</option>
                {allProcesses.map((proc) => (
                  <option key={proc} value={proc}>{proc}</option>
                ))}
              </select>
            </div>
            <div className="w-[25%] lg:w-[10%]">
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
        const filteredNumIDs = CUSTOM_NUMBER_IDS.filter((numid) =>
          data.some((d) => d.W_NumberID.includes(numid) && d.W_Process === selectedProcess)
        );
        return filteredNumIDs.length > 0 ? (
          <div className="flex flex-wrap w-full justify-center items-center lg:justify-start lg:items-start gap-4 text-center">
            {filteredNumIDs.map((numid) => {
              const isSelected = selectedNumberID === numid;
              const Displays = numid === "FM" ? "CAUTION POINT" : numid;
              return (
                <button
                  key={numid}
                  type="button"
                  onClick={() => setSelectedNumberID(isSelected ? null : numid)}
                  aria-pressed={isSelected}
                  className={` w-[20%] lg:w-[10%] py-3 px-4 rounded-2xl border text-sm text-center font-medium transition-all duration-200 ease-in-out ${isSelected ? "bg-blue-900 text-white shadow-md ring-2 ring-blue-300" : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"}`}
                >
                  {Displays}
                </button>
              );
            })}
          </div>
        ) : null;
      })()}

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

      <div className="overflow-x-auto w-full rounded-xl border border-gray-200 shadow-sm mb-4">
        <table className="w-full border-collapse text-[14px] lg:text-xl text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2">รหัสเอกสาร</th>
              <th className="border border-gray-200 px-4 py-2">ชื่อเอกสาร</th>
              <th className="border border-gray-200 px-4 py-2">PDF File</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="w-[20%] lg:w-[10%] border border-gray-200 px-4 py-2">{item.W_NumberID}</td>
                <td className="border border-gray-200 px-4 py-2">{item.W_DocName}</td>
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

      {pdfUrl && (
        <div className="fixed h-full w-full bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
          <div className="w-full h-full relative bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-50"
              onClick={() => setPdfUrl(null)}
            >
              ❌ ปิด PDF
            </button>
            <Suspense fallback={<div className="text-white text-center">Loading PDF...</div>}>
              <LazyPdfViewer url={pdfUrl} />
            </Suspense>
            {/* <Suspense fallback={<div>Loading PDF...</div>}>
              <LazyPdfIframe pdfUrl={pdfUrl} />
            </Suspense> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
