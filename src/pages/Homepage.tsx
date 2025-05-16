import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const Homepage = () => {
    const navigate = useNavigate();
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(() => {
        return localStorage.getItem(LOCAL_STORAGE_KEY) || null;
    });
    const [data, setData] = useState<DocumentType[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/ShowResult");
                setData(res.data);
            } catch (err) {
                console.error("❌ Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            localStorage.setItem(LOCAL_STORAGE_KEY, selectedDepartment);
        }
    }, [selectedDepartment]);

    const departments = Array.from(new Set(data?.map((item) => item.W_Dep)));

    const handleSelectDepartment = (dep: string) => {
        if (selectedDepartment === dep) {
            setSelectedDepartment(null);
        } else {
            setSelectedDepartment(dep);
            navigate("/FilterSearch");
        }
    };

    const renderFilter = () => (
        <div className="flex flex-col bg-white/[15%] backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 gap-4 border border-blue-100 drop-shadow-lg transition-all w-full max-w-lg">
            <h1 className="text-xl sm:text-2xl font-extrabold font-Rethink text-blue-900 text-center uppercase">Work 📄 Instruction</h1>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {departments.map((dep) => {
                    const isSelected = selectedDepartment === dep;
                    return (
                        <button
                            key={dep}
                            onClick={() => handleSelectDepartment(dep)}
                            aria-pressed={isSelected}
                            className={`py-2 px-4 sm:py-3 sm:px-6 rounded-full border font-semibold text-sm sm:text-base shadow-md transition-all duration-200
                                ${isSelected
                                    ? "bg-blue-700 text-white border-blue-700 scale-105 ring-4 ring-blue-200"
                                    : "bg-white text-blue-800 border-blue-300 hover:bg-blue-100 hover:border-blue-400"
                                }`}
                        >
                            {dep}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-300 to-blue-900 flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-10 relative">
            {/* Logo */}
            <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
                <img src="/public/images/LOGO3.png" alt="Logo" className="h-12 sm:h-[80px]" />
            </div>

            {/* Filter Section */}
            {data ? renderFilter() : (
                <div className="text-blue-800 text-lg sm:text-xl font-medium">Loading data...</div>
            )}
        </div>
    );
};

export default Homepage;
