import axios from "axios";
import { useEffect, useRef, useState } from "react";
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
const NUM_PARTICLES = 80;
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
        <div className="flex flex-col
      bg-white/25           /* สีขาวโปร่ง 25 % */
      backdrop-blur-lg      /* เบลอพื้นหลัง */
      rounded-3xl shadow-2xl
      p-6 gap-6 w-full max-w-lg items-center
      ring-1 ring-white/40  /* เส้นขอบแก้วบาง ๆ */
      hover:scale-[1.015] transition-transform duration-300">

            {/* LOGO */}
            <div className="bg-white/80 rounded-full shadow-md">
                <img
                    src="/public/images/LOGO3.png"
                    alt="Logo"
                    style={{
                        padding: '1rem',
                        height: '60px',
                        width: '60px',
                        objectFit: 'contain',
                        boxSizing: 'content-box',
                    }}
                />
            </div>

            {/* TITLE */}
            <h1 className="text-2xl sm:text-3xl font-bold font-kanit text-blue-900 text-center uppercase">
                ระบบค้นหา เอกสารกระบวนการทำงาน
            </h1>

            <h2 className="text-lg sm:text-xl font-kanit text-blue-900 text-center uppercase">
                กรุณาเลือกแผนก :
            </h2>

            {/* BUTTONS */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
                {departments.map((dep) => {
                    const isSelected = selectedDepartment === dep;
                    return (
                        <button
                            key={dep}
                            onClick={() => handleSelectDepartment(dep)}
                            aria-pressed={isSelected}
                            className={`py-2 px-6 rounded-full border font-semibold text-base shadow-md transition duration-200
              ${isSelected
                                    ? "bg-blue-700 text-white border-blue-700 scale-105 ring-4 ring-blue-300"
                                    : "bg-white/80 text-blue-800 border-blue-300 hover:bg-white hover:text-blue-900"
                                }`}
                        >
                            {dep}
                        </button>
                    );
                })}
            </div>
        </div>
    );





    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId: number;

        const particles = Array.from({ length: NUM_PARTICLES }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 1 + Math.random() * 2,
            dx: -0.5 + Math.random(),
            dy: -0.5 + Math.random(),
            alpha: 0.2 + Math.random() * 0.3
        }));

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;

                // warp around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);


    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-gradient-to-t from-blue-800/90 via-sky-400 to-blue-800/10">
            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* GRADIENT OVERLAY WITH BLUR */}
                <div className="absolute inset-0 bg-gradient-radial from-white/10 via-white/5 to-transparent blur-3xl opacity-30" />

                {/* RAIN EFFECT */}
                <svg
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    style={{ zIndex: 1 }}
                >
                    {Array.from({ length: 60 }).map((_, i) => {
                        const x = Math.random() * 100;
                        const delay = Math.random() * 5;
                        const duration = 6 + Math.random() * 4;
                        const radius = 6 + Math.random() * 12;
                        const opacity = 0.2 + Math.random() * 0.4;
                        const blur = 2 + Math.random() * 4;

                        return (
                            <circle
                                key={i}
                                cx={`${x}%`}
                                cy="110%"
                                r={radius}
                                fill="white"
                                fillOpacity={opacity}
                                style={{
                                    filter: `blur(${blur}px)`,
                                }}
                            >
                                <animate
                                    attributeName="cy"
                                    from="110%"
                                    to="-10%"
                                    dur={`${duration}s`}
                                    begin={`${delay}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        );
                    })}
                </svg>


            </div>

            {/* FOREGROUND */}
            <div className="relative z-10 w-full max-w-lg">
                {data ? renderFilter() : <p className="text-white text-xl">Loading...</p>}
            </div>
        </div>
    );

};

export default Homepage;
