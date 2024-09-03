import React from "react";

const Filters = ({ onFilterChange }) => {
  const handleChange = (filterType) => (e) => {
    const { value, checked } = e.target;
    onFilterChange(filterType, value, checked);
  };

  return (
    <div className="flex flex-col">
      {/* Date Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Date</p>
        {["2024", "2023", "2022", "2021", "2020"].map((date) => (
          <div className="mx-4" key={date}>
            <input
              type="checkbox"
              id={`date-${date}`}
              value={date}
              onChange={handleChange("date")}
            />
            <label htmlFor={`date-${date}`} className="ml-2">
              {date}
            </label>
          </div>
        ))}
      </div>

      {/* Judge Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Judge</p>
        {["Name 1", "Name 2", "Name 3"].map((judge) => (
          <div className="mx-4" key={judge}>
            <input
              type="checkbox"
              id={`judge-${judge}`}
              value={judge}
              onChange={handleChange("judge")}
            />
            <label htmlFor={`judge-${judge}`} className="ml-2">
              {judge}
            </label>
          </div>
        ))}
      </div>

      {/* Party Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Party</p>
        {["1 vs 2", "3 vs 4", "5 vs 6"].map((party) => (
          <div className="mx-4" key={party}>
            <input
              type="checkbox"
              id={`party-${party}`}
              value={party}
              onChange={handleChange("party")}
            />
            <label htmlFor={`party-${party}`} className="ml-2">
              {party}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;
