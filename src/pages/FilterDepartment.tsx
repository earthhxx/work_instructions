import { useState } from "react";

const departments = ["EN", "PRO", "QA", "WH"];

const FilterDepartment = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-gray-900">
      <h1 className="text-white text-3xl font-bold">Filter Department</h1>
      <p className="text-gray-400 mt-4 mb-8">Select a department to filter:</p>

      <div className="flex space-x-4">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${
              selectedDept === dept
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-400 hover:text-white"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {selectedDept && (
        <div className="mt-10 text-white text-lg">
          🔍 Showing results for: <span className="font-bold">{selectedDept}</span>
        </div>
      )}
    </div>
  );
};

export default FilterDepartment;
