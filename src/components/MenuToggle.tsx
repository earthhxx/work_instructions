"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi2";
import { IoIosSearch } from "react-icons/io";
import { CiFilter } from "react-icons/ci";

// 192.168.130.240


const MenuToggle = () => {
    const navigate = useNavigate();
    // Production QA Warehouse Engineer
    const [homeStage, setHomeStage] = useState<"home" | "menuOpen">("home");
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 500 });
    const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });


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

            // ถ้าเปิดเมนูอยู่ แล้วคลิกข้างนอก ให้ปิดเมนู
            if (homeStage === "menuOpen" && isClickOutsideMenu) {
                setHomeStage("home");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [homeStage]);

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
        // Production QA Warehouse Engineer
        <div className="fixed inset-0 flex flex-col w-screen h-screen justify-center items-center z-95 bg-black/20 backdrop-blur-sm">
            <div
                ref={menuRef}
                className="grid grid-cols-3 gap-4 size-fit rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-md justify-center items-center drop-shadow-2xl p-4"
            >
                
                <div
                    onClick={() => {
                        console.log("test onclick dashboard");
                        setHomeStage('home'); //idk why tf setIsMenuOpen(false); not working
                        // navigate('/Dashboard');

                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">

                    <CiFilter className="size-25 text-white" />
                    <div>DEPPARTMENT FILTER</div>
                    <div className={`font-kanit font-light text-lg`}>ตัวกรอง แผนก</div>
                </div>
                <div
                    onClick={() => {
                        setHomeStage('home');
                        navigate ('/');
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white">
                    <HiOutlineHome className="size-25 text-white" />

                    <div>HOME</div>
                    <div className="font-kanit font-light text-lg">หน้าหลัก</div>
                </div>
                <div
                    onClick={() => {
                       
                    }}
                    className="flex flex-col justify-center items-center w-full h-full text-white "
                >
                    <IoIosSearch  className="size-25 text-white" />
                    <div>SEARCH AND FILTER</div>
                    <div className="font-kanit font-light text-lg">ค้นหา และ ตัวกรอง</div>
                </div>
            </div>
        </div>
    );

  


    return (
        <>
                {homeStage === "home" && renderHomeButton()}
                {homeStage === "menuOpen" && renderMenu()}

                {/* <div className="absolute bottom-5 left-5 text-white">
                    Position: {`X: ${position.x}, Y: ${position.y}`}
                </div> */}
        </>
    );
};

export default MenuToggle;
