import { useEffect, useState } from "react";

const Filters = ({ onFilterChange, results }) => {
  const [judges, setJudges] = useState([]);
  const [parties, setParties] = useState([]);
  const [years, setYears] = useState([]);
  const [showMoreJudges, setShowMoreJudges] = useState(false);
  const [showMoreParties, setShowMoreParties] = useState(false);

  useEffect(() => {
    // Extract unique judges, parties, and years from results
    const uniqueJudges = new Set();
    const uniqueParties = new Set();
    const uniqueYears = new Set();

    results.forEach((result) => {
      const metadata = result.metadata;
      const judgeMatch = metadata.match(/\[(.*?)\]$/);
      if (judgeMatch) {
        judgeMatch[1].split(" and ").forEach((judge) => uniqueJudges.add(judge.trim()));
      }

      const partyMatch = metadata.match(/^(.+?)\nv\.\n(.+?)$/m);
      if (partyMatch) {
        uniqueParties.add(partyMatch[1].trim());
        uniqueParties.add(partyMatch[2].split("\n")[0].trim());
      }

      const yearMatch = metadata.match(/\[(\d{4})\]/);
      if (yearMatch) {
        uniqueYears.add(yearMatch[1]);
      }
    });

    setJudges(Array.from(uniqueJudges));
    setParties(Array.from(uniqueParties));
    // Sort years in descending order
    setYears(Array.from(uniqueYears).sort((a, b) => b - a));
  }, [results]);

  const handleChange = (filterType) => (e) => {
    const { value, checked } = e.target;
    onFilterChange(filterType, value, checked);
  };

  return (
    <div className="flex flex-col">
      {/* Date Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Date</p>
        {years.map((year) => (
          <div className="mx-4" key={year}>
            <input type="checkbox" id={`date-${year}`} value={year} onChange={handleChange("date")} />
            <label htmlFor={`date-${year}`} className="ml-2">
              {year}
            </label>
          </div>
        ))}
      </div>

      {/* Judge Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Judge</p>
        {(showMoreJudges ? judges : judges.slice(0, 7)).map((judge) => (
          <div className="mx-4" key={judge}>
            <input type="checkbox" id={`judge-${judge}`} value={judge} onChange={handleChange("judge")} />
            <label htmlFor={`judge-${judge}`} className="ml-2">
              {judge}
            </label>
          </div>
        ))}
        {judges.length > 7 && (
          <button
            className="mx-2 flex justify-start font-bold text-blue-400"
            onClick={() => setShowMoreJudges(!showMoreJudges)}
          >
            {showMoreJudges ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* Party Filter */}
      <div className="flex flex-col gap-1">
        <p className="mx-2 font-bold">Party</p>
        {(showMoreParties ? parties : parties.slice(0, 7)).map((party) => (
          <div className="mx-4" key={party}>
            <input type="checkbox" id={`party-${party}`} value={party} onChange={handleChange("party")} />
            <label htmlFor={`party-${party}`} className="ml-2">
              {party}
            </label>
          </div>
        ))}
        {parties.length > 7 && (
          <button
            className="mx-2 flex justify-start font-bold text-blue-400"
            onClick={() => setShowMoreParties(!showMoreParties)}
          >
            {showMoreParties ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Filters;
