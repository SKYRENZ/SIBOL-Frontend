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

  const wasteData: WasteData[] = [
    {
      id: 1,
      name: "Laurenz Listangco",
      weight: 20.5,
      area: " 1",
      date: "Oct 29, 2025",
      time: "11:50 AM",
      images: [
        "https://placehold.co/300x200?text=Waste+1",
        "https://placehold.co/300x200?text=Waste+2",
      ],
      history: [
        { date: "Oct 22, 2025", weight: "18.2kg", area: " 1" },
        { date: "Oct 15, 2025", weight: "17.8kg", area: " 1" },
        { date: "Oct 08, 2025", weight: "20.0kg", area: " 1" },
        { date: "Oct 01, 2025", weight: "19.3kg", area: " 1" },
        { date: "Sep 24, 2025", weight: "18.5kg", area: " 1" },
      ],
    },
    {
      id: 2,
      name: "Karl Miranda",
      weight: 29.8,
      area: " 2",
      date: "Oct 29, 2025",
      time: "01:50 AM",
      images: [
        "https://placehold.co/300x200?text=Waste+3",
        "https://placehold.co/300x200?text=Waste+4",
      ],
      history: [
        { date: "Oct 22, 2025", weight: "25.6kg", area: " 2" },
        { date: "Oct 15, 2025", weight: "26.0kg", area: " 2" },
        { date: "Oct 08, 2025", weight: "27.3kg", area: " 2" },
        { date: "Oct 01, 2025", weight: "28.5kg", area: " 2" },
        { date: "Sep 24, 2025", weight: "24.9kg", area: " 2" },
      ],
    },
  ];

  const filteredData = wasteData.filter((item) =>
    [item.name, item.area, item.date, item.time]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">

     {/* Search Bar + Filter (responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
        <div className="w-full sm:max-w-[400px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search"
            className="w-full"
          />
        </div>
        <div className="flex justify-end">
          <FilterPanel />
        </div>
      </div>

      {/* Waste Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedWaste(item)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start cursor-pointer hover:shadow-md transition gap-4"
          >
            <div className="flex flex-row sm:flex-col justify-between items-start gap-2 w-full">
              <div className="flex items-center gap-3">
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

              {/* Progress */}
              <div className="w-full sm:w-[160px] h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#355842] rounded-full transition-all"
                  style={{
                    width: `${Math.min((item.weight / 50) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Right */}
            <div className="text-right text-[#355842]/90 text-sm flex flex-col sm:items-end justify-between">
              <div>
                <p className="font-medium">{item.date}</p>
                <p className="text-xs mt-1 text-[#355842]/70">{item.time}</p>
              </div>
              <p className="font-semibold text-[#355842] mt-3">{item.area}</p>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <p className="col-span-full text-center text-gray-500 italic py-10">
            No waste collection data found.
          </p>
        )}
      </div>

      {/* Modal */}
  {selectedWaste && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] max-h-[85vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden p-2 sm:p-4">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full rounded-2xl">

          {/* Close Button */}
          <button
            onClick={() => setSelectedWaste(null)}
            className="absolute top-5 right-5 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-full p-2 transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#2b4632] mb-6 text-center tracking-wide">
            Waste Collection Details
          </h2>

          {/* Info Section */}
          <div className="space-y-3 text-[#355842]/90 text-sm sm:text-base leading-relaxed">
            <p>
              <span className="font-semibold">Collector:</span> {selectedWaste.name}
            </p>
            <p>
              <span className="font-semibold">Collected Weight:</span> {selectedWaste.weight} kg
            </p>
            <p>
              <span className="font-semibold">Area:</span>{" "}
              <span className="font-bold text-[#355842]">{selectedWaste.area}</span>
            </p>
          </div>

          {/* Uploaded Images */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#355842] mb-3">Uploaded Images</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedWaste.images?.map((src, index) => (
                <div
                  key={index}
                  className="w-full h-28 sm:h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                >
                  <img src={src} alt={`Waste ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Collection History */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#355842] mb-3 flex items-center gap-2">
              <Clock size={16} /> Collection History
            </h3>
            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
              {selectedWaste.history.map((record, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-[#355842]/90 py-2 border-b border-gray-100 last:border-0"
                >
                  <span>{record.date}</span>
                  <span className="font-medium">{record.weight}</span>
                  <span className="font-semibold">{record.area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white mt-2 flex justify-end">
          <button
            onClick={() => setSelectedWaste(null)}
            className="px-5 py-2 bg-[#355842] text-white rounded-full hover:bg-[#2e4a36] transition text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default WasteCollectionTab;
