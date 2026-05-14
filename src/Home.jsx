import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";
import { Search, Loader2 } from "lucide-react";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoxes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const collections = [
          { name: "OTC", id: "Lf65VMqsGmqXyVacNpm7" },
          { name: "ZUELIG", id: "gahm0WOb9SQKnzaduYYW" },
          { name: "UNILAB", id: "9gE9fQT7Q1sWxc7cDsgp" },
          { name: "METRO", id: "zggN1nUqZiq2LHe5uUNz" },
          { name: "GENERICS", id: "ysOiPUPknCIEdUcsE7l1" },
          { name: "BRANDED", id: "Jiy2XMUeGk4uTQOThXaV" },
        ];

        const allResults = await Promise.all(
          collections.map(async ({ name, id }) => {
            const querySnapshot = await getDocs(collection(db, name));
            const doc = querySnapshot.docs.find(doc => doc.id === id);
            
            if (!doc?.exists()) return [];

            const data = doc.data();
            if (!data.box) return [];

            return Object.entries(data.box).flatMap(([row, items]) =>
              items.map((item, index) => ({
                name: item,
                row,
                collection: name,
                position: index + 1, // Item position within the row
                searchKey: item.toLowerCase()
              }))
            );
          })
        );

        setResults(allResults.flat());
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const filteredResults = useMemo(() => {
    const searchKey = searchTerm.toLowerCase();
    return searchTerm
      ? results.filter(item => item.searchKey.includes(searchKey))
      : [];
  }, [results, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClick = (row, collection) => {
    navigate(`/${collection.toLowerCase()}?row=${row}`);
  };

  if (error) {
    return (
      <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative">
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            id="search"
            placeholder="Search for items..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        searchTerm && (
          <ul className="mt-4 divide-y divide-gray-200 border rounded-lg overflow-hidden">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleClick(item.row, item.collection)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      Row {parseInt(item.row) + 1} - {item.collection} (Item #{item.position})
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                No results found for "{searchTerm}"
              </li>
            )}
          </ul>
        )
      )}
    </div>
  );
};

export default Home;
