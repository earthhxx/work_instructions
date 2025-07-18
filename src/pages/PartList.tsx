import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { BsUpcScan } from "react-icons/bs";
import { GoCheckCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { Viewer} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Types
type DataItem120_2 = {
    productOrderNo: string;
    productName: string;
    ProcessLine: string;
};

type DataItem120_9 = {
    id: number;
    PL_Line: string;
    PL_Id: string;
    PL_ModelName: string;
    PL_Rev: string;
    PL_PDF: string;
    PL_User: string;
};

// Component
const Main = () => {
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "pdf">("scan");
    const [productOrderNo, setProductOrderNo] = useState("");
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);
    const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);



    const cardRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    // ---------- Fetch Data 120-2 ----------
    const fetchData120_2 = async () => {
        if (!productOrderNo) return;

    
        try {
            const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${productOrderNo}`);
            const result = await res.json();

            if (!result?.data || result.success === false || result.error) {
                alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
                navigate("/");
                return;
            }
            setData120_2(result.data);
        } catch (error) {
            console.error("Failed to fetch 120-2:", error);
            alert("API 120-2 ผิดพลาด");
            navigate("/");
        } finally {
    
        }
    };

    // ---------- Fetch Data 120-9 ----------
    useEffect(() => {
        const fetchData120_9 = async () => {
            if (!data120_2?.ProcessLine || !data120_2?.productName) return;

            try {
                const res = await fetch(`/api/120-9/Partlist?line=${data120_2.ProcessLine}&model=${data120_2.productName}`);
                const result = await res.json();

                if (!result?.data || result.success === false || result.error) {
                    alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
                    navigate("/");
                    return;
                }

                setData120_9(result.data[0]);
            } catch (error) {
                console.error("Failed to fetch 120-9:", error);
                alert("API 120-9 ผิดพลาด");
                navigate("/");
            } finally {

            }
        };

        fetchData120_9();
    }, [data120_2, navigate]);

    // ---------- Show PDF ----------
    useEffect(() => {
        const pdfPath = data120_9?.PL_PDF;
        if (pdfPath) {
            const encodedPath = encodeURIComponent(pdfPath);
            setPdfUrl(`/api/open-pdf?path=${encodedPath}`);
        }
    }, [data120_9]);

    // ---------- Click Outside to Close Scanner ----------
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (homeStage === "scan" && cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setHomeStage("scan")
                stopCamera();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [homeStage]);

    // ---------- Start QR Scan ----------
    const startCamera = async () => {
        const qrRegionId = "qr-reader";
        const qrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = qrCode;

        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras.length) return;

            const preferredCam = cameras.find(cam => cam.label.toLowerCase().includes("back") || cam.label.toLowerCase().includes("environment")) || cameras[0];
            const deviceId = preferredCam.id;

            await qrCode.start(
                { deviceId: { exact: deviceId } },
                { fps: 10, qrbox: 300 },
                (decodedText) => {
                    if (homeStage === "scan") {
                        setProductOrderNo(decodedText);
                        if (inputRef.current) inputRef.current.value = decodedText;
                        qrCode.stop().then(() => qrCode.clear());
                        scannerRef.current = null;
                    }
                },
                (err) => console.warn("QR scan error:", err)
            );
        } catch (error) {
            console.error("Camera error:", error);
        }
    };

    const stopCamera = () => {
        if (scannerRef.current) {
            scannerRef.current.stop()
                .then(() => scannerRef.current?.clear())
                .catch((e) => console.error("Stop camera error:", e));
        }
    };

    // ---------- Render PDF ----------
    const renderPDF = () => (
        pdfUrl && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="relative w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
                    <button
                        onClick={() => {
                            setPdfUrl(null);
                            navigate("/");
                        }}
                        className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        ❌ ปิด PDF
                    </button>
                    
                        <Viewer
                            fileUrl={pdfUrl}
                            defaultScale={3.0}
                            plugins={[defaultLayoutPluginInstance]}
                        />
                    
                </div>
            </div>
        )
    );

    // ---------- Render QR Scanner ----------
    const renderScanner = () => (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div
                ref={cardRef}
                className="size-[28rem] xl:size-[36rem] flex flex-col gap-4 bg-gray-800/70 p-6 rounded-2xl shadow-lg items-center"
            >
                <div className="text-white text-center">โปรดใส่รหัสผลิตภัณฑ์ของคุณ :</div>
                <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="product id..."
                    onChange={(e) => setProductOrderNo(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-lg border dark:bg-gray-700 dark:text-white"
                />
                <div className="flex w-full">
                    <div className="w-1/2 flex flex-col items-center text-white text-xl font-kanit">
                        <span onClick={startCamera} className="cursor-pointer">
                            <BsUpcScan className="size-32" />
                        </span>
                        <div>SCAN</div>
                        <div>สแกน</div>
                    </div>
                    <div
                        onClick={() => {
                            fetchData120_2();
                            setHomeStage("pdf");
                        }}
                        className="w-1/2 flex flex-col items-center text-white text-xl font-kanit cursor-pointer"
                    >
                        <GoCheckCircle className="size-30" />
                        <div>SUBMIT</div>
                        <div>ส่งข้อมูล</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHome = () => <div>home</div>;

    // ---------- Render ----------
    return (
        <div>
            {homeStage === "scan" && renderScanner()}
            {homeStage === "home" && renderHome()}
            {homeStage === "pdf" && renderPDF()}
        </div>
    );
};

export default Main;
