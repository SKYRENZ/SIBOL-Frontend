import { Award } from "lucide-react";
import { useState, useEffect } from "react";

const PointSystem = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [waste, setWaste] = useState("1kg");
  const [points, setPoints] = useState("30 SIBOL Points");

  useEffect(() => {
    console.log("PointSystem mounted");
    return () => console.log("PointSystem unmounted");
  }, []);

  const handleEdit = () => setIsEditable(true);
  const handleSave = () => setIsEditable(false);

  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-start gap-3 mb-6">
        <Award className="w-8 h-8 text-[#355842]" />
        <div>
          <h2 className="text-[#355842] font-semibold text-lg">
            Current Point System
          </h2>
          <p className="text-gray-600 text-sm">
            Got ideas on what to reward? Update your point system.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D8E3D8] rounded-xl shadow-sm w-full max-w-2xl mx-auto p-8 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-6 w-full">
          <div className="flex flex-col items-center text-center">
            <label className="text-sm font-medium text-[#355842] mb-1">
              Total Food Waste
            </label>
            <input
              type="text"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              disabled={!isEditable}
              className={`border rounded-md px-3 py-2 text-sm text-center w-24 transition ${
                isEditable
                  ? "border-[#7B9B7B] focus:outline-none focus:ring-2 focus:ring-[#7B9B7B] bg-white"
                  : "border-gray-300 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>

          <span className="text-[#355842] font-semibold text-xl">=</span>

          <div className="flex flex-col items-center text-center">
            <label className="text-sm font-medium text-[#355842] mb-1">
              Points
            </label>
            <input
              type="text"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              disabled={!isEditable}
              className={`border rounded-md px-3 py-2 text-sm text-center w-40 transition ${
                isEditable
                  ? "border-[#7B9B7B] focus:outline-none focus:ring-2 focus:ring-[#7B9B7B] bg-white"
                  : "border-gray-300 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <button
            onClick={handleEdit}
            className={`text-sm font-medium px-6 py-2 rounded-md transition ${
              isEditable
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#355842] text-white hover:bg-[#2e4a36]"
            }`}
            disabled={isEditable}
          >
            Edit
          </button>

          <button
            onClick={handleSave}
            className={`text-sm font-medium px-6 py-2 rounded-md transition ${
              isEditable
                ? "bg-[#355842] text-white hover:bg-[#2e4a36]"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isEditable}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointSystem;
