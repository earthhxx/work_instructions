"use client";
import { useState, useRef, useEffect } from "react";
import { BsUpcScan, BsClipboard2DataFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { VscSignIn } from "react-icons/vsc";
import { MdHistory } from "react-icons/md";
import { GoCheckCircle } from "react-icons/go";
import { AiFillHome } from "react-icons/ai";




// Util สำหรับจัดการ localStorage
function setJsonToLocalStorage<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value } }));
}

function getJsonFromLocalStorage<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

// function removeItemFromLocalStorage(key: string) {
//     localStorage.removeItem(key);
//     window.dispatchEvent(new CustomEvent("local-storage-change", { detail: { key, value: null } }));
// }

const MenuToggle = () => {
    const navigate = useNavigate();
    const [homeStage, setHomeStage] = useState<"home" | "scan" | "dashboard" | "menuOpen" | "signin">("home");
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 500 });
    const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
    const [productOrderNo, setProductOrderNo] = useState("");
    const [employeeID, setEmployeeID] = useState("");
    const cardRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const handler = () => {
            // เช่น reset state หรือ redirect
            console.log("productOrderNo ถูกลบแล้ว");
            // อัปเดต state เพื่อให้ component รู้ว่ามีการลบ
            setProductOrderNo("");
        };

        window.addEventListener("productOrderNo:removed", handler);

        return () => {
            window.removeEventListener("productOrderNo:removed", handler);
        };
    }, []);


    useEffect(() => {
        //เช็ค event ถ้ามีค่า === prod or ค่าใหม่
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "productOrderNo") {
                setProductOrderNo(event.newValue || "");
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // โหลดค่าจาก localStorage
        const stored = getJsonFromLocalStorage<string>("productOrderNo");
        if (stored && typeof stored === "string") {
            setProductOrderNo(stored);
        }

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);


    const handleSaveAndNavigate = () => {
        setJsonToLocalStorage("productOrderNo", productOrderNo);
        (`/StatusPage?productOrderNo=${encodeURIComponent(productOrderNo)}`);
        setProductOrderNo
        clearinputref();
    };
    const handleNextPageStatus = () => {
        const value = inputRef.current?.value.trim();

        if (!value) {
            alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
            return;
        }
        handleSaveAndNavigate();

    };

    const handleSaveAndNavigateSignin = () => {
        if (employeeID.length > 0 && employeeID.length <= 4) {
            const mockID: string[] = ['0506', '0743', '0965', '3741']; // Replace with the actual mock ID values
            if (mockID.includes(employeeID)) {
                window.location.href = ('http://192.168.120.9:3004/RegisterResultReflow');
                setEmployeeID("");
                clearinputref();
                return;
            }
            else {
                alert("รหัสพนักงานนี้ไม่อยู่ในระบบ");
                setEmployeeID("");
                clearinputref();
            }
        }
        else {
            alert("กรุณากรอกรหัสพนักงานอย่างน้อย 3 ตัวอักษร");
            setEmployeeID("");
            clearinputref();
        }
    };
    const handleNextPageSignin = () => {
        const value = inputRef.current?.value.trim();

        if (!value) {
            alert("กรุณากรอกหรือสแกนรหัสก่อนเข้าสู่หน้าถัดไป");
            return;
        }
        handleSaveAndNavigateSignin();
    }


    useEffect(() => {
        if (typeof window !== "undefined") {
            setDragBounds({
                left: 0,
                top: 0,
                right: window.innerWidth - 80,
                bottom: window.innerHeight - 80,
            });
        }
    }, []);



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);
            const isClickOutsideCard = cardRef.current && !cardRef.current.contains(event.target as Node);

            // ถ้าเปิดเมนูอยู่ แล้วคลิกข้างนอก ให้ปิดเมนู
            if (homeStage === "menuOpen" && isClickOutsideMenu) {
                setHomeStage("home");

            }

            // ถ้าอยู่หน้า scan แล้วคลิกข้างนอก card ให้กลับ home
            if (homeStage === "scan" && isClickOutsideCard) {
                setHomeStage("home");
            }

            // ถ้าอยู่หน้า signin แล้วคลิกข้างนอก card ให้กลับ home
            if (homeStage === "signin" && isClickOutsideCard) {
                setHomeStage("home");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeStage]);
  
    


    const clearinputref = () => {
        if (inputRef.current) inputRef.current.value = "";
    };


    const renderHomeButton = () => (
        <motion.div
            className="fixed h-fit w-fit justify-center items-center pb-8 pt-5 pl-3 pr-3 z-95"
            whileTap={{ scale: 0.9 }}
            drag
            dragConstraints={dragBounds}
            dragElastic={0.2}
            style={{ x: position.x, y: position.y }}
            onDragEnd={(_e, info) => {
                setPosition({ x: info.point.x, y: info.point.y });
            }}
        >
            <div className="flex flex-col size-[62px] justify-start items-start z-10 animate-bounce">
                <div className="fixed flex flex-col size-[62px] bg-black/70 blur-[4] rounded-2xl justify-center items-center mr-[3px] mt-[2px] ml-[2px] cursor-pointer z-10 drop-shadow-2xl"></div>
                <div
                    className="fixed flex flex-col size-15 bg-white blur-[4] rounded-2xl justify-center items-center mr-[2px] cursor-pointer z-20"
                    onClick={() => {
                        setHomeStage("menuOpen");
                    }}
                >
                    <img src="/images/LOGO3.png" alt="Menu Image" width={50} height={50} draggable={false} />
                </div>
                <span className="relative top-0 left-12 inline-flex size-3 rounded-full bg-blue-800 z-40">
                    <span className="absolute inline-flex size-3 h-full w-full animate-ping rounded-full bg-sky-700 opacity-75 z-50" />
                </span>
            </div>
        </motion.div>
    );

    const renderMenu = () => (
        <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">
            <div
                ref={menuRef}
                className="grid grid-cols-3 gap-4 size-160 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-4"
            >
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {

                        setHomeStage('home'); //idk why tf setIsMenuOpen(false); not working
                        navigate ('/');

                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <AiFillHome className="size-25 text-white m-4" />

                    <div>HOME</div>
                    <div className="font-kanit text-xl">หน้าหลัก</div>
                </div>
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        console.log("test onclick dashboard");
                        setHomeStage('home'); //idk why tf setIsMenuOpen(false); not working
                        navigate('/Dashboard');

                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">

                    <BsClipboard2DataFill className="size-25 text-white m-4" />
                    <div>REALTIME CHECK</div>
                    <div className="font-kanit text-xl">เช็คสถานะ โปรไฟล์</div>


                </div>
                <div
                    onClick={() => {
                        if (productOrderNo || productOrderNo !== '') {
                            setHomeStage("home");
                            navigate(`/StatusPage?productOrderNo=${productOrderNo}`);

                        }
                        else {
                            setHomeStage("scan");
                        }
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white cursor-pointer"
                >
                    <BsUpcScan className="size-25 text-white m-4" />
                    <div>STANDARD SEARCH</div>
                    <div className="font-kanit text-xl">ค้นหา ข้อกำหนด</div>
                </div>
                <div
                    onClick={() => {
                        console.log("test onclick HistoryPage");
                        setHomeStage('home'); //idk why tf setIsMenuOpen(false); not working
                        window.location.href = ('http://192.168.120.9:3004/HistoryRefiow');

                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <MdHistory className="size-25 text-white m-4" />
                    <div>HISTORY SEARCH</div>
                    <div className="font-kanit text-xl">ค้นหาประวัติ</div>
                </div>
                <div className="flex w-full h-full"></div>
                <div
                    onClick={() => {
                        console.log("test onclick signin");
                        setHomeStage("signin");
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <VscSignIn className="size-25 text-white m-4" />
                    <div>SIGN IN</div>
                    <div className="font-kanit text-xl">ล็อคอิน</div>
                </div>
                <div className="flex flex-col justify-center items-center w-full h-full text-white">

                </div>
            </div>
        </div>
    );

    const renderScanCard = () => {
        if (homeStage !== "scan") return null;

        return (

            <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">

                <div
                    ref={cardRef}
                    className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl h-fit p-6"
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
                                
                                className="flex w-1/2 h-32 justify-center">
                                <BsUpcScan className="size-32 text-white"></BsUpcScan>
                            </span>
                            <div>SCAN</div>
                            <div>สแกน</div>
                        </div>
                        <div
                            onClick={() => {

                                handleNextPageStatus();
                                setHomeStage("home");
                                clearinputref();
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

    const renderSigninCard = () => {
        if (homeStage !== "signin") return null;

        return (
            <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">
                <div
                    ref={cardRef}
                    className="transition-all duration-300 scale-100 opacity-100 flex flex-col gap-4 size-150 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl h-fit p-6"
                >
                    <div className="flex justify-center items-center w-full text-white">
                        Please enter your ID :
                    </div>
                    <div className="flex justify-center items-center w-full text-white">
                        โปรดใส่รหัสของคุณ :
                    </div>
                    <div id="qr-reader" style={{ width: "400px", height: "400px" }}></div>
                    <input
                        ref={inputRef}
                        type="text"
                        autoComplete="off"
                        id="employee_id"
                        onChange={(e) => setEmployeeID(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg m-4 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Your employee id..."
                    />
                    <div className="flex w-full h-fit items-center">
                        <div className="flex flex-col text-xl text-white justify-center items-center font-kanit w-1/2">
                            <span
                                className="flex w-1/2 h-32 justify-center">
                                <BsUpcScan className="size-32 text-white"></BsUpcScan>
                            </span>
                            <div>SCAN</div>
                            <div>สแกน</div>
                        </div>
                        <div
                            onClick={() => {
                                handleNextPageSignin();
                                setHomeStage("home");
                                clearinputref();
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




    return (
        <>
                {homeStage === "home" && renderHomeButton()}
                {homeStage === "menuOpen" && renderMenu()}
                {homeStage === "scan" && renderScanCard()}
                {homeStage === "signin" && renderSigninCard()}

                <div className="absolute bottom-5 left-5 text-white">
                    Position: {`X: ${position.x}, Y: ${position.y}`}
                </div>
        </>
    );
};

export default MenuToggle;
