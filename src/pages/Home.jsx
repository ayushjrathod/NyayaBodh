import React, { useState, useRef, useEffect } from "react";
import Filters from "../components/Home/Filters";
import DisplayedResult from "../components/Home/DisplayedResult";
import resultsData from "../../public/results.json";
import axios from "../api/axios";

const Home = () => {
  const inputRef = useRef();
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState(resultsData);
  const [filters, setFilters] = useState({
    date: [],
    judge: [],
    party: [],
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setQuery(inputRef.current.value);
    console.log(query);
    axios
      .post("/api/search", { cors: true }, { query })
      .then((res) => {
        console.log(res);
        // If you want to update results based on the search, uncomment the next line
        // setFilteredResults(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prevFilters) => {
      const updatedFilter = checked
        ? [...prevFilters[filterType], value]
        : prevFilters[filterType].filter((item) => item !== value);
      return { ...prevFilters, [filterType]: updatedFilter };
    });
  };

  useEffect(() => {
    const filtered = resultsData.filter((result) => {
      const metadata = result.metadata;
      const yearMatch = metadata.match(/\[(\d{4})\]/);
      const judgeMatch = metadata.match(/\[(.*?)\]$/);
      const partyMatch = metadata.match(/^(.+?)\nv\.\n(.+?)$/m);

      const matchesDate =
        filters.date.length === 0 ||
        (yearMatch && filters.date.includes(yearMatch[1]));

      const matchesJudge =
        filters.judge.length === 0 ||
        (judgeMatch &&
          filters.judge.some((judge) => judgeMatch[1].includes(judge)));

      const matchesParty =
        filters.party.length === 0 ||
        (partyMatch &&
          (filters.party.includes(partyMatch[1].trim()) ||
            filters.party.includes(partyMatch[2].split("\n")[0].trim())));

      return matchesDate && matchesJudge && matchesParty;
    });

    setFilteredResults(filtered);
  }, [filters]);

  return (
    <div className="flex justify-between m-2">
      <div className="h-screen w-1/6">
        <Filters onFilterChange={handleFilterChange} results={resultsData} />
      </div>
      <div className="h-fit border-l-2 w-5/6">
        <div className="bg-gray-200 rounded-lg flex justify-center w-full mx-1">
          <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex just">
            <input
              type="text"
              ref={inputRef}
              onKeyDown={handleKeyDown}
              placeholder="Enter your search query...."
              className="w-full border-none outline-none"
            />
            <div className="relative">
              <button onClick={onSubmit}>
                <i className="bx bx-send bx-sm"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="mx-6">
          <DisplayedResult results={filteredResults} />
        </div>
      </div>
    </div>
  );
};

export default Home;
