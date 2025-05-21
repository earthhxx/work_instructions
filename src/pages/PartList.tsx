import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { BsUpcScan } from "react-icons/bs";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { GoCheckCircle } from "react-icons/go";

type DataItem120_2 = {
    productOrderNo: string;
    productName: string;
    ProcessLine: string;
};


const main = () => {
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "pdf">("scan");
    const [data, setData] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const cardRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [productOrderNo, setProductOrderNo] = useState("");
    const [data120_2, setData120_2] = useState<DataItem120_2 | null>(null);


    // useEffect (()=>)
    // const fetchPdfData2 = async () => {

    //     try {
    //         if (!data120_2?.ProcessLine || !data120_2?.productName ) {
    //             alert("⛔ พารามิเตอร์ไม่ครบ ไม่โหลด PDF")
    //             console.warn("⛔ พารามิเตอร์ไม่ครบ ไม่โหลด PDF");
    //             return;
    //         }

    //         const res = await fetch(
    //             `/api/120-9/checkreflow/load-pdf-data2?R_Line=${data120_2.ProcessLine}&R_Model=${data120_2.productName}&productOrderNo=${ProductOrderNo}`
    //         );
    //         const { data } = await res.json();
    //         console.log("✅ ได้ข้อมูล PDF2:", data);

    //         if (data?.R_PDF2) {
    //             const decoded = atob(data.R_PDF2);
    //             if (decoded.startsWith('%PDF-') || decoded.startsWith('JVBER')) {
    //                 handleShowPdf2(data.R_PDF2);
    //             } else {
    //                 alert("PDF2 format ผิดพลาด");
    //                 console.warn("⚠️ PDF2 format ผิดพลาด");
    //                 setPdfWarning2('PDF2 format ผิดพลาด');

    //             }
    //         } else if (!data || data.R_PDF2 === "null" || "undifined") {
    //             setshowAlert(true);
    //             setAlertData("ยังไม่มีการอัพโหลดผลการวัดโปรไฟล์");
    //             console.warn("⚠️ ไม่พบข้อมูล R_PDF2");
    //             setPdfWarning2('ยังไม่มีการอัพโหลด PDF2');
    //         } else {
    //             alert("ยังไม่มีการอัพโหลด PDF2 error 2");
    //             console.warn("⚠️ ไม่พบข้อมูล R_PDF2 error 2");
    //             setPdfWarning2('ยังไม่มีการอัพโหลด PDF2');

    //         }
    //     } catch (err) {
    //         alert("โหลด PDF2 ผิดพลาด");
    //         console.error("❌ โหลด PDF2 ล้มเหลว:", err);
    //         setPdfWarning2("เกิดข้อผิดพลาดระหว่างโหลด PDF");
    //     }
    // };


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
    useEffect(() => {
        const checkPdfAccess = async () => {
            try {
                const testUrl = `http://192.168.130.240:5009/api/open-pdf?path=${encodeURIComponent("\\192.168.120.9\\DataDocument\\SD-PD-03-00 ขั้นตอนการจัดการเมื่อ AOI ตรวจพบ NG.pdf")}`;
                console.log("Checking PDF access with URL:", testUrl);
                const response = await axios.head(testUrl);
                if (response.status !== 200) {
                    console.warn("PDF access check failed with status:", response.status);
                } else {
                    console.log("PDF access check succeeded.");
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("❌ Axios error while checking PDF access:", err.message, "\nResponse:", err.response);
                } else {
                    console.error("❌ Unexpected error while checking PDF access:", err);
                }
            }
        };

        checkPdfAccess();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/ShowResult");
                setData(res.data);
            } catch (err) {
                console.error("❌ Error fetching data:", err);
            } finally {
                setLoading(false);
                console.log(loading);
                console.log(data);
            }
        };
        fetchData();
    }, []);

    const handleShowPdf = (PDFPATH: string) => {
        const url = `http://192.168.130.240:5009/api/open-pdf?path=${encodeURIComponent(PDFPATH)}`;
        setPdfUrl(url);
    };

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
                                handleShowPdf("\\\\192.168.120.9\\DataDocument\\SD-FC-EN-04-02 ขั้นตอนการเปลี่ยนแปลงโปรแกรม AOI.pdf");
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
