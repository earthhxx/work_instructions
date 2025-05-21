import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { BsUpcScan } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { GoCheckCircle } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { SpecialZoomLevel } from '@react-pdf-viewer/core';


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



const main = () => {
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "pdf">("scan");
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const cardRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [productOrderNo, setProductOrderNo] = useState("");
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);
    const [data120_9, setData120_9] = useState<DataItem120_9 | null>(null);
    const [isLoading120_2, setIsLoading120_2] = useState(true);
    const [isLoading120_9, setIsLoading120_9] = useState(true);
    const router = useNavigate();



    // Fetching Data 120_2
    const fetchData = async () => {
        if (!productOrderNo) return;
        console.log("Fetching data for ProductOrderNo:", productOrderNo);
        setIsLoading120_2(true);

        try {
            console.log("ProductOrderNo:", productOrderNo);
            const res = await fetch(`/api/120-2/scan-to-db-120-2?productOrderNo=${productOrderNo}`);
            const data = await res.json();
            console.log("Fetched Data from 120-2:", data);

            if (!data || !data.data || data.success === false || data.error) {
                alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
                router('/');
            }

            setData120_2(data.data);
        } catch (error) {
            console.error("Failed to fetch 120-2:", error);
            alert(`api ผิดพลาด`);
            router('/');
        } finally {
            setIsLoading120_2(false);
        }
    };

    useEffect(() => {
        // Fetching Data 120_9
        const fetchData120_9 = async () => {
            if (!data120_2?.ProcessLine || !data120_2?.productName) return;

            console.log("Fetching data for line && model:", (data120_2.ProcessLine, ',', data120_2.ProcessLine));
            setIsLoading120_9(true);

            try {
                const res = await fetch(`/api/120-9/Partlist?line=${data120_2.ProcessLine}&model=${data120_2.productName}`);
                const data = await res.json();
                console.log('in api', data);
                if (!data || !data.data || data.success === false || data.error) {
                    alert("ข้อมูลไม่ถูกต้องหรือว่างเปล่า");
                    router('/');
                }

                setData120_9(data.data[0]);
            } catch (error) {
                console.error("Failed to fetch 120-2:", error);
                alert(`api ผิดพลาด`);
                router('/');
            } finally {
                setIsLoading120_9(false);
            }
        };
        fetchData120_9();
    }, [data120_2])


    useEffect(() => {
        console.log('useeff')
        console.log('useeff', data120_9);
        const url_9 = data120_9?.PL_PDF;
        if (url_9) {
            console.log('useefffff', url_9)
            handleShowPdf(url_9);
        }
    }, [data120_9]);

    const handleShowPdf = (PDFPATH: string) => {
        console.log('before', PDFPATH);
        const url = `http://192.168.130.240:5009/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
        setPdfUrl(url);
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutsideCard = cardRef.current && !cardRef.current.contains(event.target as Node);

            // ถ้าอยู่หน้า scan แล้วคลิกข้างนอก card ให้กลับ home
            if (homeStage === "scan" && isClickOutsideCard) {
                setHomeStage("pdf");
                clearCamera();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeStage]);

    const renderpdf = () => {
        return (
            <div>
                {/* PDF Viewer */}
                {pdfUrl && (
                    <div className="fixed h-full w-full bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
                        <div className="w-full h-full relative bg-white rounded-xl shadow-lg overflow-hidden">
                            <button
                                className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-50"
                                onClick={() => {
                                    setPdfUrl(null)
                                    setHomeStage("scan")
                                }
                                }
                            >
                                ❌ ปิด PDF
                            </button>
                            <Worker workerUrl="/pdf.worker.min.js">
                                <Viewer
                                    fileUrl={pdfUrl}
                                    defaultScale={3.0}
                                    plugins={[defaultLayoutPluginInstance]}
                                />
                            </Worker>
                        </div>
                    </div>
                )}
            </div>
        );
    };




    const startScan = async () => {
        const qrRegionId = "qr-reader";
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;

        try {
            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) return;

            const backCam = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
            const deviceId = backCam ? backCam.id : devices[0].id;

            await html5QrCode.start({ deviceId: { exact: deviceId } }, { fps: 10, qrbox: 300 },
                (decodedText) => {
                    if (homeStage === "scan") {
                        setProductOrderNo(decodedText);
                        if (inputRef.current) inputRef.current.value = decodedText;
                        html5QrCode.stop().then(() => html5QrCode.clear());
                        scannerRef.current = null;
                    }
                    else {
                        console.log("QR code detected but not in scan or signin mode.");
                    }
                },
                (err) => console.warn("Scan error:", err)
            );
        } catch (err) {
            console.error("Camera initialization failed:", err);
        }
    };

    const clearCamera = () => {
        if (scannerRef.current) {
            // ถ้าเป็น Html5Qrcode instance
            if ("stop" in scannerRef.current) {
                scannerRef.current
                    .stop()      // หยุดกล้อง
                    .then(() => scannerRef.current!.clear()) // ล้าง DOM และ memory
                    .catch((e: Error) => console.error("Stop error:", e));
            }
            // ถ้าเป็น Html5QrcodeScanner instance
            else {
                (scannerRef.current as Html5QrcodeScanner)
                    .clear()
                    .then(() => {
                        scannerRef.current = null;
                    })
                    .catch((e: Error) => console.error("Clear error:", e));
            }
        }
    };

    const renderScanCard = () => {
        if (homeStage !== "scan") return null;

        return (

            <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-50 bg-black/20 backdrop-blur-sm">

                <div
                    ref={cardRef}
                    className="transition-all duration-300 opacity-100 flex flex-col gap-4 size-110 xl:size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-6"
                >
                    <div className="flex justify-center items-center w-full text-white">
                        Please enter Product ID :
                    </div>
                    <div className="flex justify-center items-center w-full text-white">
                        โปรดใส่รหัสผลิตภัณฑ์ของคุณ :
                    </div>
                    <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                    <input
                        ref={inputRef}
                        type="text"
                        id="product_id"
                        onChange={(e) => setProductOrderNo(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="product id..."
                    />
                    <div className="flex w-full h-fit items-center">
                        <div className="flex flex-col text-xl text-white justify-center items-center font-kanit w-1/2">
                            <span
                                onClick={startScan}
                                className="flex w-1/2 h-32 justify-center">
                                <BsUpcScan className="size-32 text-white"></BsUpcScan>
                            </span>
                            <div>SCAN</div>
                            <div>สแกน</div>
                        </div>
                        <div
                            onClick={() => {
                                fetchData();
                                setHomeStage("pdf");
                            }}
                            className="flex flex-col text-xl text-white justify-center items-center font-kanit w-1/2">
                            <GoCheckCircle className="size-30 " />
                            <div>
                                SUBMIT
                            </div>
                            <div>
                                ส่งข้อมูล
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };




    const renderHome = () => {
        return <div>home</div>;
    };






    return (
        <div>
            {homeStage === "scan" && renderScanCard()}
            {homeStage === "home" && renderHome()}
            {homeStage === "pdf" && renderpdf()}
        </div>
    );
};






export default main;
