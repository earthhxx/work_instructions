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
    const [Data, setData] = useState<DocumentType[] | null>(null);

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
        } else {
        }
    }, [selectedDepartment]);

    // Unique departments only
    const datadepartment = Array.from(new Set(Data?.map(item => item.W_Dep)));

    const renderfilter = () => {
        return (
            <div className="flex flex-wrap w-full justify-center items-center gap-4 py-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg mb-8">
                {datadepartment.map((dep) => {
                    const isSelected = selectedDepartment === dep;

                    return (
                        <button
                            key={dep}
                            type="button"
                            onClick={() => {
                                if (isSelected) {
                                    setSelectedDepartment(null);
                                } else {
                                    setSelectedDepartment(dep);
                                    navigate('/FilterSearch');
                                }
                            }}
                            aria-pressed={isSelected}
                            className={`min-w-[120px] py-3 px-6 rounded-2xl border text-base text-center font-semibold shadow transition-all duration-200 ease-in-out
                            ${
                                isSelected
                                    ? "bg-blue-700 text-white border-blue-700 scale-105 ring-4 ring-blue-200"
                                    : "bg-white text-blue-900 border-blue-300 hover:bg-blue-100 hover:border-blue-400"
                            }`}
                        >
                            {dep}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl lg:text-6xl font-bold text-blue-900 mt-10 mb-6 drop-shadow">Departments</h1>
            {Data && renderfilter()}
            {/* You can add more content here, e.g. a list of documents */}
        </div>
    );
};

export default Homepage;
