import React, { useState } from "react";
import FilterPanel from "../filterPanel";
import SearchBar from "../common/SearchBar";

const ClaimedRewards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const rewardsData = [
    {
      id: 1,
      name: "Krisha Mae Alcaide",
      reward: "1 kilo of Rice",
      points: "100pts",
      code: "112103",
      status: "Unclaimed",
      date: "....",
    },
    {
      id: 2,
      name: "Joemen Barrios",
      reward: "1 kilo of Rice",
      points: "100pts",
      code: "112103",
      status: "Claimed",
      date: "10/08/25",
    },
  ];

  const filteredData = rewardsData.filter((item) =>
    [item.name, item.reward, item.status, item.code, item.points, item.date]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        {/* Search Input */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search claimed rewards..."
          className="max-w-[100vh] flex-grow"
        />
        <FilterPanel />
      </div>

      {/* 🧾 Table Section */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-[#E6F0E6] text-[#355842] font-medium">
            <tr>
              <th className="px-6 py-3 w-10">#</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Reward</th>
              <th className="px-6 py-3">Points Used</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date Claimed</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 hover:bg-[#f9fbf9] transition"
                >
                  <td className="px-6 py-3">{item.id}</td>
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3">{item.reward}</td>
                  <td className="px-6 py-3">{item.points}</td>
                  <td className="px-6 py-3">{item.code}</td>

                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Claimed"
                          ? "bg-[#D9EBD9] text-[#355842]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-3">{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-6 text-center text-gray-500 italic"
                >
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClaimedRewards;
