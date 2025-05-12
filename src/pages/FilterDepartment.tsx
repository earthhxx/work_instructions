import { useState, useEffect } from "react";

const departments = ["EN", "PRO", "QA", "WH"];

interface DocumentData {
  id: number;
  W_NumberID: string;
  W_Revision: string;
  W_DocName: string;
  W_Dep: string;
  W_Process: string;
  W_PDFs: string;
  W_name: string;
  Datetime: string;
}

const FilterDepartment = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedDept) return;
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3010/api/documents?dept=${selectedDept}`
        );
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedDept]);

  return (
    <div className="flex flex-col justify-center items-center w-screen min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-3xl font-bold">Filter Department</h1>
      <p className="text-gray-400 mt-4 mb-8">Select a department to filter:</p>

      <div className="flex flex-wrap gap-4 justify-center">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${
              selectedDept === dept
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-400 hover:text-white"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {selectedDept && (
        <div className="mt-10 text-white text-lg">
          🔍 Showing results for: <span className="font-bold">{selectedDept}</span>
        </div>
      )}

      <div className="mt-6 w-full max-w-4xl">
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-md text-gray-800"
            >
              <h2 className="font-bold text-lg">{doc.W_DocName}</h2>
              <p>Document No: {doc.W_NumberID}-{doc.W_Revision}</p>
              <p>Process: {doc.W_Process}</p>
              <p>Created by: {doc.W_name}</p>
              <p className="text-sm text-gray-600">Datetime: {doc.Datetime}</p>
              <a
                href={doc.W_PDFs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-2 block"
              >
                🔗 View PDF
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilterDepartment;
