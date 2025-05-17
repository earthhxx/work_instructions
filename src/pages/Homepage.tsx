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
        <div className="flex flex-col bg-white/[90%] backdrop-blur-xl rounded-4xl shadow-2xl p-4 sm:p-6 gap-4 border border-blue-100 drop-shadow-2xl transition-all w-full max-w-lg">
            <h1 className="text-xl sm:text-2xl font-bold font-kanit text-blue-900 text-center uppercase">ระบบค้นหา📄เอกสารกระบวนการทำงาน </h1>
            <h1 className="text-xl sm:text-sm font-kanit text-blue-900 text-center uppercase">กรุณาเลือกแผนก :</h1>
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
        
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-700 to-blue-900 flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-10 relative overflow-hidden">
            <div className="fixed inset-0 w-full h-full z-0">
                <img
                    src="/public/images/tai_img1.jpg"
                    alt="Background"
                    className="w-full h-full object-cover object-center"
                />
            </div>
            {/* Particle Backdrop */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
            >
                {/* Rain Effect */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        zIndex: 1,
                        overflow: "hidden",
                    }}
                >
                    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block" }}>
                        {Array.from({ length: 80 }).map((_, i) => {
                            const x = Math.random() * 100;
                            const delay = Math.random() * 2;
                            const duration = 0.8 + Math.random() * 0.8;
                            const opacity = 0.15 + Math.random() * 0.25;
                            const length = 18 + Math.random() * 18;
                            return (
                                <rect
                                    key={i}
                                    x={`${x}%`}
                                    y="-30"
                                    width="2"
                                    height={length}
                                    fill="#fff"
                                    fillOpacity={opacity}
                                >
                                    <animate
                                        attributeName="y"
                                        from="-30"
                                        to="110%"
                                        dur={`${duration}s`}
                                        begin={`${delay}s`}
                                        repeatCount="indefinite"
                                    />
                                </rect>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Logo */}
            <div className="absolute top-2 left-2 sm:top-6 sm:left-6 z-10">
                <img src="/public/images/LOGO3.png" alt="Logo" className="h-12 sm:h-[80px]" />
            </div>

            {/* Filter Section */}
            <div className="z-10 w-full flex justify-center">
                {data ? renderFilter() : (
                    <div className="text-blue-800 text-lg sm:text-xl font-medium">Loading data...</div>
                )}
            </div>
        </div>
    );
};

export default Homepage;
