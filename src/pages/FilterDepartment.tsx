import { useEffect, useState } from "react";

interface CategoryProps {
  department: "EN" | "PRO" | "QA" | "WH";
}

const Category = ({ department }: CategoryProps) => {
  const cate1 = [
  "LASER",
  "Loading",
  "Printer",
  "SPI",
  "Mouter",
  "AOI",
  "ICT",
  "Remove FPC",
  "FCT",
  "Blanking",
  "Oven",
  "X-Ray",
  "Coating",
  "Router",
  "Image Checker"
];
  const cate2 = ["QA-CAT1", "QA-CAT2"];
  const cate3 = ["PRO-CAT1", "PRO-CAT2"];
  const cate4 = ["WH-CAT1", "WH-CAT2"];

  const [maincate, setMaincate] = useState<string[]>([]);

  useEffect(() => {
    if (department === "EN") {
      setMaincate(cate1);
    } else if (department === "QA") {
      setMaincate(cate2);
    } else if (department === "PRO") {
      setMaincate(cate3);
    } else if (department === "WH") {
      setMaincate(cate4);
    }
  }, [department]);

  return (
    <section className="bg-gray-50 py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Process
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {maincate.map((cat, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg
                className="me-2 h-4 w-4 shrink-0 text-gray-900 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v5m-3 0h6M4 11h16M5 15h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1Z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {cat}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};


const FilterDepartment = () => {
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);
  const departments: Array<"EN" | "PRO" | "QA" | "WH"> = ["EN", "PRO", "QA", "WH"];
  const [departmentStates, setDepartmentStates] = useState<"EN" | "PRO" | "QA" | "WH" | "none">("none");

  return (
    <>
      <div className="flex flex-col justify-center items-center w-screen min-h-screen bg-gray-900 p-8">
        <h1 className="text-white text-3xl font-bold">Filter Department</h1>
        <p className="text-gray-400 mt-4 mb-8">Select a department to filter:</p>

        <div className="flex flex-wrap gap-4 justify-center">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => {
                setDepartmentStates(dept);
                setIsCategoryVisible(true);
              }}
              className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${departmentStates === dept
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-400 hover:text-white"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>


        {departmentStates && (
          <div className="mt-10 text-white text-lg">
            🔍 Showing results for: <span className="font-bold">{departmentStates}</span>
          </div>
        )}
        {isCategoryVisible && departmentStates !== "none" && (
        <Category department={departmentStates} />
      )}
      </div>
    </>

  );
};

export default FilterDepartment;
