import React, { useState,useRef } from "react";
import Filters from "../components/Home/Filters";
import DisplayedResult from "../components/Home/DisplayedResult";
import resultsData from "../../public/results.json";
import axios from "../api/axios";

const FilterableResults = () => {
  // Process Input
    const inputRef = useRef();
    const [query, setQuery] = useState("");
    //const [resultsData, setResultsData] = useState([]);
  
    const onSubmit = (e) => {
      e.preventDefault();
      setQuery(inputRef.current.value);
      console.log(query);

      axios
        .post("/api/search",
          {cors: true,},
          { query })
        .then((res) => {
          console.log(res);
          //setResultsData(res.data);
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

  // Filter resuts 
  const [filters, setFilters] = useState({
    date: [],
    judge: [],
    party: [],
  });

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prevFilters) => {
      const updatedFilter = checked
        ? [...prevFilters[filterType], value]
        : prevFilters[filterType].filter((item) => item !== value);
      return { ...prevFilters, [filterType]: updatedFilter };
    });
  };

  const filteredResults = resultsData.filter((result) => {
    const matchesDate =
      filters.date.length === 0 || filters.date.includes(result.date);
    const matchesJudge =
      filters.judge.length === 0 || filters.judge.includes(result.judge);
    const matchesParty =
      filters.party.length === 0 || filters.party.includes(result.party);

    return matchesDate && matchesJudge && matchesParty;
  });


  return (
    <div className="flex justify-between m-2">
      <div className=" h-screen w-1/4">
        <Filters onFilterChange={handleFilterChange} />
      </div>
      <div className="h-fit border-l-2 w-3/4">
          <div className="bg-gray-100 rounded-lg flex justify-center w-full">
            <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex just">
              <input
                type="text"
                ref={inputRef}
                onKeyDown={handleKeyDown}
                placeholder="Enter your search query...."
                className="w-full border-none outline-none"
              />
              <div className=" relative">
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

export default FilterableResults;
