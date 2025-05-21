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

const LOCAL_STORAGE_KEY = "selectedDepartment";
const LOCAL_STORAGE_KEY2 = "selectedProcess";

const Homepage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DocumentType[] | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/Result");
                setData(res.data);
            } catch (err) {
                console.error("❌ Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    // Compute unique departments
    const departments = Array.from(
        new Set(data?.map((item) => item.W_Dep) ?? [])
    );

    // Group processes by department
    interface DeptGroup {
        department: string;
        processes: string[];
    }
    const groups: DeptGroup[] = departments.map((dep) => ({
        department: dep,
        processes: Array.from(
            new Set(
                data!
                    .filter((d) => d.W_Dep === dep)

                    .map((d) => d.W_Process)
                    .filter(Boolean)
            )
        ),
    }));

    const handleClick = (dep: string, proc: string) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, dep);
        localStorage.setItem(LOCAL_STORAGE_KEY2, proc);
        navigate("/FilterSearch");
    };

    const renderFilter = () => (
        <div className="flex flex-col w-full bg-white/25 backdrop-blur-lg rounded-3xl shadow-2xl p-6 gap-6 items-center ring-1 ring-white/40 hover:scale-[1.015] transition-transform duration-300">
            {/* LOGO */}
            <div className="bg-white/80 rounded-full shadow-md">
                <img
                    src="/public/images/LOGO3.png"
                    alt="Logo"
                    className="p-4 h-25 w-25 object-contain"
                />
            </div>

            {/* TITLE */}
            <h1 className="text-3xl lg:text-4xl font-bold font-kanit text-blue-900 text-center uppercase">
                ระบบค้นหา เอกสารกระบวนการทำงาน
            </h1>

            {/* Departments & Processes */}
            <div className="">
                {groups.map(({ department, processes }) => (
                    <div key={department} className="flex flex-col mb-8">
                        {/* Department Header */}
                        <h2 className="text-2xl font-bold font-kanit text-blue-900 uppercase mb-3">
                            {department}
                        </h2>

                        {/* Process Buttons */}
                        <div className="grid grid-cols-2 lg:grid-cols-6  justify-center items-center gap-6 ">
                            {processes.map((proc) => (
                                <button
                                    key={proc}
                                    onClick={() => handleClick(department, proc)}
                                    className="w-full py-2 px-6 rounded-full border font-semibold text-base shadow-md transition duration-200 bg-white text-black border-blue-400/70 hover:bg-blue-600 hover:text-white"
                                >
                                    {proc}
                                </button>

                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Particle background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId: number;
        const particles = Array.from({ length: 80 }, () => ({
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
        const drawParticles = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(drawParticles);
        };
        resize();
        window.addEventListener("resize", resize);
        drawParticles();
        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-gradient-to-t from-sky-200 via-sky-100 to-[#fdfdfb]">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-radial from-white/10 via-white/5 to-transparent blur-3xl opacity-30" />
                <svg width="100%" height="100%" className="absolute inset-0" style={{ zIndex: 1 }}>
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
                                style={{ filter: `blur(${blur}px)` }}
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

            <div className="flex justify-center z-10 w-full max-w-[75%]">
                {data ? renderFilter() : <p className="text-white text-xl">Loading...</p>}
            </div>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};

export default Homepage;
