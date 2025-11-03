import React, { useState } from "react";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { X, Clock } from "lucide-react";

interface WasteData {
  id: number;
  name: string;
  weight: number;
  area: string;
  date: string;
  time: string;
  images: string[];
  history: { date: string; weight: string; area: string }[];
}

const WasteCollectionTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWaste, setSelectedWaste] = useState<WasteData | null>(null);

  // 🗑️ Placeholder data (will come from backend later)
  const wasteData: WasteData[] = [
    {
      id: 1,
      name: "Laurenz Listangco",
      weight: 20.5,
      area: "Area 1",
      date: "Oct 29, 2025",
      time: "11:50 AM",
      images: [
        "https://placehold.co/300x200?text=Waste+1",
        "https://placehold.co/300x200?text=Waste+2",
      ],
      history: [
        { date: "Oct 22, 2025", weight: "18.2kg", area: "Area 1" },
        { date: "Oct 15, 2025", weight: "17.8kg", area: "Area 1" },
        { date: "Oct 08, 2025", weight: "20.0kg", area: "Area 1" },
        { date: "Oct 01, 2025", weight: "19.3kg", area: "Area 1" },
        { date: "Sep 24, 2025", weight: "18.5kg", area: "Area 1" },
      ],
    },
    {
      id: 2,
      name: "Karl Miranda",
      weight: 29.8,
      area: "Area 2",
      date: "Oct 29, 2025",
      time: "01:50 AM",
      images: [
        "https://placehold.co/300x200?text=Waste+3",
        "https://placehold.co/300x200?text=Waste+4",
      ],
      history: [
        { date: "Oct 22, 2025", weight: "25.6kg", area: "Area 2" },
        { date: "Oct 15, 2025", weight: "26.0kg", area: "Area 2" },
        { date: "Oct 08, 2025", weight: "27.3kg", area: "Area 2" },
        { date: "Oct 01, 2025", weight: "28.5kg", area: "Area 2" },
        { date: "Sep 24, 2025", weight: "24.9kg", area: "Area 2" },
      ],
    },
  ];

  // ✅ Filter search
  const filteredData = wasteData.filter((item) =>
    [item.name, item.area, item.date, item.time]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      {/* 🔍 Search Bar + Filter */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search"
          className="max-w-[100vh] flex-grow"
        />
        <FilterPanel />
      </div>

      {/* ♻️ Waste Collection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedWaste(item)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex justify-between items-start cursor-pointer hover:shadow-md transition"
          >
            {/* Left Section — Avatar, Info, Progress */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-[#355842] flex items-center justify-center text-[#355842] font-semibold">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#355842] text-sm">
                    {item.name}
                  </p>
                  <p className="text-sm text-[#355842]/80">{item.weight}kg</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-[160px] h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#355842] rounded-full transition-all"
                  style={{
                    width: `${Math.min((item.weight / 50) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Right Section — Date, Time, and Area */}
            <div className="text-right text-[#355842]/90 text-sm flex flex-col items-end justify-between h-full">
              <div>
                <p className="font-medium">{item.date}</p>
                <p className="text-xs mt-1 text-[#355842]/70">{item.time}</p>
              </div>
              <p className="font-semibold text-[#355842] mt-3">{item.area}</p>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <p className="col-span-full text-center text-gray-500 italic py-10">
            No waste collection data found.
          </p>
        )}
      </div>

      {/* Modal */}
{selectedWaste && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative overflow-hidden">
      {/* Inner scroll container */}
      <div className="overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full rounded-3xl">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedWaste(null)}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 transition bg-gray-100 rounded-full p-1"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-semibold text-[#355842] mb-5">
          Waste Collection Details
        </h2>

        {/* Info Section */}
        <div className="space-y-2 text-[#355842]/90 text-sm">
          <p>
            <span className="font-semibold">Collector:</span>{" "}
            {selectedWaste.name}
          </p>
          <p>
            <span className="font-semibold">Collected Weight:</span>{" "}
            {selectedWaste.weight} kg
          </p>
          <p>
            <span className="font-semibold">Area:</span>{" "}
            {selectedWaste.area}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {selectedWaste.date}
          </p>
          <p>
            <span className="font-semibold">Time:</span>{" "}
            {selectedWaste.time}
          </p>
        </div>

        {/* Images Section */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#355842] mb-2">
            Uploaded Images
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {selectedWaste.images.map((src, index) => (
              <div
                key={index}
                className="w-full h-32 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200"
              >
                <img
                  src={src}
                  alt={`Waste ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* logs */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#355842] mb-2 flex items-center gap-2">
            <Clock size={16} /> Area Collection History
          </h3>
          <div className="border border-gray-200 rounded-2xl p-3 max-h-48 overflow-y-auto bg-gray-50/30 scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
            {selectedWaste.areaHistory && selectedWaste.areaHistory.length > 0 ? (
              selectedWaste.areaHistory.map((record, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-[#355842]/90 py-1 border-b border-gray-100 last:border-0"
                >
                  <span>{record.date}</span>
                  <span className="font-medium">{record.weight}</span>
                  <span className="font-semibold">{record.collector}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm italic">
                No previous records for this area.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={() => setSelectedWaste(null)}
            className="px-5 py-2 bg-[#355842] text-white rounded-full hover:bg-[#2e4a36] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default WasteCollectionTab;
