import { useState, useRef, useEffect } from "react";
import "../css/Register_DC.css";

interface Errors {
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  text6?: string;
  text7?: string;
  file?: string;
}

export default function RegisterDC() {
  const [formData, setFormData] = useState({
    text1: "",
    text2: "",
    text3: "",
    text4: "",
    text5: "",
    text6: "",
    text7: "",
  });
  const [processOptions, setProcessOptions] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [modals, setModals] = useState({
    showUser: false,
    showIncompleteError: false,
    showFileNameError: false,
  });
  const [expectedFileName] = useState<string>("");

  const refs = {
    text3: useRef<HTMLInputElement | null>(null),
    text4: useRef<HTMLInputElement | null>(null),
    text5: useRef<HTMLInputElement | null>(null),
    text6: useRef<HTMLSelectElement | null>(null),
    text7: useRef<HTMLSelectElement | null>(null),
  };

  useEffect(() => {
    const processMap: Record<string, string[]> = {
      Production: [
        "LASER", "Loading", "Printer", "SPI", "Mouter", "AOI", "ICT",
        "Remove FPC", "FCT", "Blanking", "Oven", "X-Ray", "Coating",
        "Router", "Image Checker",
      ],
      QA: [
        "IQA", "IPQC_SMT line", "IPQC_After process", "IPQC_Laser Marking",
        "OQA_Automotive", "OQA_consumer", "Final inspection_PMRTH",
        "Final inspection_META-BCM", "Final inspection_META-SCA",
        "Final inspection_META-CD8", "Final inspection_PASAP Fac.6",
        "Final inspection_TNTH", "Final inspection_Nidec", "Final inspection_Kyocara",
        "Final inspection_AISIN_AHB-G", "Final inspection_AISIN_AHB-C",
        "Final inspection_PMFTH", "Final inspection_PASAP Fac.1",
        "Final inspection_CASIO", "Final inspection_KURABE",
        "Repair_Automotive", "Repair_Consimer",
      ],
    };
    setProcessOptions(processMap[formData.text6] || []);
    if (formData.text6 === "Warehouse") setFormData((prev) => ({ ...prev, text7: "" }));
  }, [formData.text6]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.text1) newErrors.text1 = "กรุณากรอกรหัสพนักงาน";
    if (!formData.text3) newErrors.text3 = "กรุณากรอก No. เอกสาร";
    if (!formData.text4) newErrors.text4 = "กรุณาระบุ Rv.";
    if (!formData.text5) newErrors.text5 = "กรุณากรอกชื่อเอกสาร";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setModals((prev) => ({ ...prev, showIncompleteError: true }));
      return false;
    }
    return true;
  };

  const fetchEmployeeName = async (empId: string) => {
    if (!empId) return;
    try {
      const response = await fetch(`http://192.168.130.240:5006/api/get-employee/${empId}`);
      if (response.ok) {
        const data = await response.json();
        handleInputChange("text2", data.name || "ไม่พบข้อมูล");

        if (data.name === "ไม่พบข้อมูล") {
          setErrors((prev) => ({
            ...prev,
            text2: "ไม่พบข้อมูลชื่อพนักงาน กรุณาตรวจสอบชื่อพนักงาน",
          }));
          setModals((prev) => ({ ...prev, showUser: true }));
        }
      } else {
        handleInputChange("text2", "ไม่พบข้อมูล");
        setErrors((prev) => ({
          ...prev,
          text2: "ไม่พบข้อมูลชื่อพนักงาน กรุณาตรวจสอบชื่อพนักงาน",
        }));
        setModals((prev) => ({ ...prev, showUser: true }));
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      handleInputChange("text2", "Error");
      setErrors((prev) => ({
        ...prev,
        text2: "เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล กรุณาลองใหม่",
      }));
      setModals((prev) => ({ ...prev, showUser: true }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      alert("กรุณาเลือกไฟล์ PDF เท่านั้น!");
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsUploading(true);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submissionData.append(key, value));
    if (file) submissionData.append("file", file);

    try {
      const dbName = "db1";
      const response = await fetch(`http://192.168.130.240:5006/api/insert/${dbName}`, {
        method: "POST",
        body: submissionData,
        mode: "cors",
      });

      if (response.ok) {
        alert("บันทึกข้อมูลสำเร็จ!");
        setFormData({
          text1: "",
          text2: "",
          text3: "",
          text4: "",
          text5: "",
          text6: "",
          text7: "",
        });
        setFile(null);
        setErrors({});
      } else {
        const errorData = await response.json();
        alert("เกิดข้อผิดพลาด: " + (errorData.error || "ไม่สามารถบันทึกข้อมูลได้"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = (modalKey: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalKey]: false }));
  };

  return (
    <div className="container-st">
      <div className="h1-st">
        <h2>ลงทะเบียนเอกสาร</h2>
      </div>
      <div className="container-box-pdf">
        <div className="form-box">
          <label>รหัสพนักงาน</label>
          <input
            type="text"
            placeholder="กรุณาใส่รหัสพนักงาน"
            className="input-field"
            value={formData.text1}
            onChange={(e) => handleInputChange("text1", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEmployeeName(formData.text1)}
          />
          {errors.text1 && <p className="error-text">{errors.text1}</p>}

          <label>ชื่อพนักงาน</label>
          <input type="text" className="input-field employee-name-box" value={formData.text2} readOnly />
          {errors.text2 && <p className="error-text">{errors.text2}</p>}

          <div className="model-line-container">
            <div className="field-group">
              <label>แผนก</label>
              <select
                ref={refs.text6}
                className="input-field"
                value={formData.text6}
                onChange={(e) => handleInputChange("text6", e.target.value)}
              >
                <option value="">-- กรุณาเลือกแผนก --</option>
                <option value="Production">Production</option>
                <option value="QA">QA</option>
              </select>
              {errors.text6 && <p className="error-text">{errors.text6}</p>}
            </div>

            <div className="field-group">
              <label>ขบวนการ</label>
              <select
                ref={refs.text7}
                className="input-field"
                value={formData.text7}
                onChange={(e) => handleInputChange("text7", e.target.value)}
                disabled={processOptions.length === 0}
              >
                <option value="">-- กรุณาเลือก Process --</option>
                {processOptions.map((opt, index) => (
                  <option key={index} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.text7 && <p className="error-text">{errors.text7}</p>}
            </div>
          </div>

          <div className="model-line-container">
            <div className="field-group">
              <label>หมายเลขเอกสาร</label>
              <input
                ref={refs.text3}
                type="text"
                placeholder="กรุณาใส่หมายเลขเอกสาร"
                className="input-field"
                value={formData.text3}
                onChange={(e) => handleInputChange("text3", e.target.value)}
              />
              {errors.text3 && <p className="error-text">{errors.text3}</p>}
            </div>
            <div className="field-group">
              <label>Revision</label>
              <input
                ref={refs.text4}
                type="text"
                placeholder="กรุณาใส่ Revision"
                className="input-field"
                value={formData.text4}
                onChange={(e) => handleInputChange("text4", e.target.value)}
              />
              {errors.text4 && <p className="error-text">{errors.text4}</p>}
            </div>
          </div>

          <label>ชื่อเอกสาร</label>
          <input
            ref={refs.text5}
            type="text"
            placeholder="กรุณาใส่ชื่อเอกสาร"
            className="input-field"
            value={formData.text5}
            onChange={(e) => handleInputChange("text5", e.target.value)}
          />
          {errors.text5 && <p className="error-text">{errors.text5}</p>}

          <label>อัพโหลดไฟล์</label>
          <input type="file" className="file-upload" accept="application/pdf" onChange={handleFileChange} />
          {errors.file && <p className="error-text">{errors.file}</p>}
          {file && <p>ไฟล์ที่เลือก: {file.name}</p>}

          <div className="form-buttons">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={isUploading || formData.text2 === "ไม่พบข้อมูล"}
            >
              {isUploading ? "กำลังอัปโหลด..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>

        {file && (
          <div className="pdf-preview">
            <iframe src={URL.createObjectURL(file)} title="PDF Preview" />
          </div>
        )}

        {modals.showUser && (
          <Modal
            title="❌ ไม่พบข้อมูลรหัสพนักงาน"
            message="กรุณาตรวจสอบรหัสพนักงานที่สแกนหรือพิมพ์ให้ถูกต้อง"
            onClose={() => closeModal("showUser")}
          />
        )}
        {modals.showIncompleteError && (
          <Modal
            title="❌ ข้อมูลไม่ครบถ้วน"
            message="กรุณากรอกข้อมูลให้ครบทุกช่องก่อนกดบันทึก"
            onClose={() => closeModal("showIncompleteError")}
          />
        )}
        {modals.showFileNameError && (
          <Modal
            title="❌ ชื่อโมเดลไม่ตรงกับชื่อไฟล์ PDF"
            message={`ชื่อโมเดลที่กรอก: ${formData.text3}\nชื่อไฟล์ PDF: ${expectedFileName}\nกรุณาให้ชื่อโมเดลตรงกับชื่อไฟล์ PDF ก่อนกดบันทึก`}
            onClose={() => closeModal("showFileNameError")}
          />
        )}
      </div>
    </div>
  );
}

function Modal({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content-rg flashing-border">
        <div className="warning-icon">⚠️</div>
        <h2 style={{ color: "red" }}>{title}</h2>
        <p>{message}</p>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
}
