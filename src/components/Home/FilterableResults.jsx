import React, { useState } from "react";
import Filters from "./Filters";
import DisplayedResult from "./DisplayedResult";
import resultsData from "../../../public/results.json";

const FilterableResults = () => {
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
    <div className="flex">
      <Filters onFilterChange={handleFilterChange} />
      <DisplayedResult results={filteredResults} />
    </div>
  );
};

export default FilterableResults;
