import React, { useState } from "react";
import SearchBar from "../common/SearchBar";
import { X, Clock, MapPin } from "lucide-react";
import WasteCollectionMap from "./WasteCollectionMap";

interface WasteData {
  id: number;
  name: string;
  weight: number;
  area: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  images: string[];
  history: { date: string; weight: string; operator: string }[];
}

const WasteCollectionTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWaste, setSelectedWaste] = useState<WasteData | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const wasteData: WasteData[] = [
    {
      id: 1,
      name: "Laurenz Listangco",
      weight: 20.5,
      area: "Petunia",
      date: "Oct 29, 2025",
      time: "11:50 AM",
      latitude: 14.6760, // Example: Quezon City coordinates
      longitude: 121.0437,
      images: [
        "https://placehold.co/300x200?text=Waste+1",
        "https://placehold.co/300x200?text=Waste+2",
      ],
      history: [
        { date: "Oct 22, 2025 - 11:00 AM", weight: "18.2kg", operator: "Karl Miranda" },
        { date: "Oct 15, 2025 - 10:30 AM", weight: "17.8kg", operator: "Justine Bryan" },
        { date: "Oct 08, 2025 - 09:45 AM", weight: "20.0kg", operator: "Laurenz" },
        { date: "Oct 01, 2025 - 08:15 AM", weight: "19.3kg", operator: "Ezedrez" },
        { date: "Sep 24, 2025 - 07:50 AM", weight: "18.5kg", operator: "Jace" },
      ],
    },
    {
      id: 2,
      name: "Karl Miranda",
      weight: 29.8,
      area: "Congressional",
      date: "Oct 29, 2025",
      time: "01:50 AM",
      latitude: 14.6840,
      longitude: 121.0500,
      images: [
        "https://placehold.co/300x200?text=Waste+3",
        "https://placehold.co/300x200?text=Waste+4",
      ],
      history: [
        { date: "Oct 22, 2025 - 01:10 AM", weight: "25.6kg", operator: "Laira" },
        { date: "Oct 15, 2025 - 02:25 AM", weight: "26.0kg", operator: "Samis" },
        { date: "Oct 08, 2025 - 03:30 AM", weight: "27.3kg", operator: "Krisha" },
        { date: "Oct 01, 2025 - 04:00 AM", weight: "28.5kg", operator: "Alcaide" },
        { date: "Sep 24, 2025 - 05:15 AM", weight: "24.9kg", operator: "Peralta" },
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
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
        <div className="w-full sm:max-w-[400px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search"
            className="w-full"
          />
        </div>
      </div>

      {/* Waste Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedWaste(item)}
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#355842] text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {item.area}
                </p>
                <p className="text-sm text-[#355842]/80">{item.weight}kg</p>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#355842] rounded-full transition-all"
                    style={{
                      width: `${Math.min((item.weight / 50) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-right text-[#355842]/90 text-sm">
                <p className="font-medium">{item.date}</p>
                <p className="text-xs mt-1 text-[#355842]/70">{item.time}</p>
                <p className="font-semibold text-[#355842] mt-3">{item.name}</p>
              </div>
            </div>

            {/* Hover Effect - Show Quick Preview */}
            {hoveredCard === item.id && (
              <div className="absolute inset-0 bg-[#355842]/95 text-white p-4 flex flex-col justify-center items-center gap-2 transition-opacity duration-300">
                <MapPin size={32} />
                <p className="text-sm font-semibold">Click to view details</p>
                <p className="text-xs opacity-80">Location & Collection Logs</p>
              </div>
            )}
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
          <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-h-[85vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedWaste(null)}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-full p-2 transition"
            >
              <X size={18} />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2b4632] mb-6 text-center tracking-wide">
                Waste Collection Details
              </h2>

              <div className="space-y-3 text-[#355842]/90 text-sm sm:text-base leading-relaxed">
                <p>
                  <span className="font-semibold">Area:</span>{" "}
                  <span className="font-bold text-[#355842]">{selectedWaste.area}</span>
                </p>
              </div>

              {/* Map */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#355842] mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Collection Location
                </h3>
                <WasteCollectionMap
                  latitude={selectedWaste.latitude}
                  longitude={selectedWaste.longitude}
                  area={selectedWaste.area}
                  weight={selectedWaste.weight}
                />
              </div>

              {/* Uploaded Images */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#355842] mb-3">
                  Uploaded Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedWaste.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-full h-28 sm:h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`Waste ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection History */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-[#355842] mb-3 flex items-center gap-2">
                  <Clock size={16} /> Collection History
                </h3>

                <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-[#AFC8AD] scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
                  {/* Header */}
                  <div className="grid grid-cols-[1.3fr_1fr_1fr] font-semibold text-xs sm:text-sm text-[#355842] bg-gray-50 sticky top-0 border-b border-gray-300 py-2 px-3">
                    <span>Date & Time</span>
                    <span>Collected Weight</span>
                    <span>Operator</span>
                  </div>

                  {/* Rows */}
                  {selectedWaste.history.map((record, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1.3fr_1fr_1fr] text-sm text-[#355842]/90 py-2 px-3 border-b border-gray-100 last:border-0"
                    >
                      <span>{record.date}</span>
                      <span className="font-medium">{record.weight}</span>
                      <span className="font-semibold truncate">{record.operator}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-white flex justify-end">
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
