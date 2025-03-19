"use client";
import { useState } from "react";

interface SearchResult {
  title: string;
  snippet: string;
}

export default function LeadGeneratorPage() {
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (pageNum = 1) => {
    if (!profession || !location) {
      alert("Please enter both profession and location");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `/api/scrape?profession=${encodeURIComponent(profession)}&location=${encodeURIComponent(location)}&page=${pageNum}`
      );
      const data = await response.json();
      console.log("Raw search results:", data);
      setTableData(Array.isArray(data) ? data : []);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
            Lead Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find business contacts across social platforms in seconds
          </p>
        </div>

        {/* Input Fields */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg mb-8 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Profession
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Enter profession (e.g., Photographer)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 dark:placeholder-gray-500
                           transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city/country (e.g., London)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 dark:placeholder-gray-500
                           transition-all duration-200"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white
                     hover:bg-zinc-800 dark:hover:bg-gray-100
                     text-white dark:text-gray-900 font-medium text-lg
                     transition-all duration-200 transform hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     shadow-md hover:shadow-lg border border-gray-700 dark:border-gray-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Searching...
              </span>
            ) : (
              "Search Leads"
            )}
          </button>
        </div>

        {/* Search Results */}
        {tableData.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tableData.map((item, index) => {
                    const emailMatch = item.snippet.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/);
                    const phoneMatch = item.snippet.match(/(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/);
                    const email = emailMatch ? emailMatch[0] : "N/A";
                    const phone = phoneMatch ? phoneMatch[0] : "N/A";

                    return (
                      <tr key={index} 
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{item.title}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`${email !== "N/A" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                            {email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`${phone !== "N/A" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                            {phone}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Button */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => handleSearch(currentPage + 1)}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700
                         text-white font-medium
                         transition-all duration-200 transform hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-md hover:shadow-lg"
              >
                {loading ? "Loading..." : "Load More Results"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
