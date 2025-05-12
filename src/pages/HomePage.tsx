import { useState, type JSX } from "react";

const Card = (): JSX.Element => {
    return (
        <div className="p-4 bg-white rounded-xl shadow">
            <h2 className="text-lg font-semibold">Section 1</h2>
            <p className="text-sm text-gray-600">Some quick information here.</p>
        </div>
    );
};


export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div className="min-h-screen min-w-screen space-y-4">
            <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
            <p className="text-gray-700">
                This is the main dashboard or landing page of your application.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                    onClick={() => setCount(count + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Click me
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: count }).map((_, index) => (
                    <Card key={index} />
                ))}
            </div>
        </div>
    );
}
