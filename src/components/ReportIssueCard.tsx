import { useState, useEffect, useRef } from 'react';

const ReportIssueCard = () => {
  const [state, setState] = useState<"idle" | "open">('idle');

  const [selectedDept, setSelectedDept] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ClickOutside = (event: MouseEvent) => {
      if (
        state === 'open' &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setState('idle');
      }
    };

    document.addEventListener('mousedown', ClickOutside);
    return () => document.removeEventListener('mousedown', ClickOutside);
  }, [state]);



  const handlesubmit = async () => {
    // เช็คข้อมูลก่อนส่ง
    if (!name || !selectedDept || !description) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          department: selectedDept,
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
        return;
      }

      alert(data.message || 'รายงานปัญหาสำเร็จ');
      setName('');
      setSelectedDept('');
      setDescription('');
      setState('idle');
    } catch (error) {
      console.error('ส่งข้อมูลไม่สำเร็จ:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };


  const idle = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setState('open')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
      >
        <div className="flex items-center justify-center space-x-2 gap-2">
          แจ้งปัญหา
          <img
            src="/images/michelle-hi4.png"
            alt="Logo"
            width={30}
            height={30}
          />
        </div>
      </button>
    </div>
  );

  const ReportForm = () => (
    <div className="fixed flex items-center justify-center min-h-screen w-screen backdrop-blur-md z-50">
      <div ref={formRef} className="bg-blue-900/85 shadow-xl rounded-lg p-8 w-full max-w-xl backdrop-blur-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">แบบฟอร์มแจ้งปัญหา</h2>

        {/* ชื่อ */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 text-sm font-medium text-white">ชื่อ</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            placeholder="กรอกชื่อของคุณ"
          />
        </div>

        {/* แผนก */}
        <div className="mb-4">
          <label htmlFor="department" className="block mb-1 text-sm font-medium text-white">แผนก</label>
          <select
            id="department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-white text-white text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 uppercase bg-blue-900/75 "
          >
            <option value="">-- เลือกแผนก -- </option>
            <option value="external">บุคคลภายนอก</option>
            <option value="customer">Customer</option>
            <option value="engineer">Engineer</option>
            <option value="production">Production</option>
            <option value="accounting">Accounting</option>
            <option value="warehouse">Warehouse</option>
            <option value="qa">QA</option>
            <option value="it">IT</option>
            <option value="hr">HR</option>
          </select>
        </div>

        {/* รายละเอียดของปัญหา */}
        <div className="mb-6">
          <label htmlFor="description" className="block mb-1 text-sm font-medium text-white">รายละเอียดของปัญหา</label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            placeholder="รายละเอียดของปัญหาที่พบบ่อย"
          ></textarea>
        </div>

        {/* ปุ่มส่ง */}
        <div className="text-center">
          <button
            onClick={handlesubmit}
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 "
          >
            ส่ง
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='z-50'>
      {state === 'idle' && idle()}
      {state === 'open' && ReportForm()}
    </div>
  );
};

export default ReportIssueCard;
