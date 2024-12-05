import "boxicons";
import { useEffect, useState } from "react";

const tooltipTextStyles = {
  visibility: "hidden",
  width: "120px",
  backgroundColor: "black",
  color: "#fff",
  textAlign: "center",
  borderRadius: "6px",
  padding: "5px 0",
  position: "absolute",
  zIndex: 1,
  bottom: "125%", // Position above the icon
  left: "50%",
  marginLeft: "-60px",
  opacity: 0,
  transition: "opacity 0.3s",
};

const tooltipContainerStyles = {
  position: "relative",
  display: "inline-block",
};

const showTooltip = (e) => {
  const tooltip = e.currentTarget.querySelector(".tooltip-text");
  tooltip.style.visibility = "visible";
  tooltip.style.opacity = 1;
};

const hideTooltip = (e) => {
  const tooltip = e.currentTarget.querySelector(".tooltip-text");
  tooltip.style.visibility = "hidden";
  tooltip.style.opacity = 0;
};

const Filters = ({ onFilterChange, results }) => {
  const [judges, setJudges] = useState([]);
  const [parties, setParties] = useState([]);
  const [years, setYears] = useState([]);
  const [showMoreJudges, setShowMoreJudges] = useState(false);
  const [showMoreParties, setShowMoreParties] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(true);
  const [isPartiesExpanded, setIsPartiesExpanded] = useState(true);
  const [isJudgesExpanded, setIsJudgesExpanded] = useState(true);

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
    <div>
      <div>
        <div className="flex items-center">
          <button className="font-bold mb-1 text-[#5a67d8]" onClick={() => setIsDataExpanded(!isDataExpanded)}>
            {isDataExpanded ? "v" : ">"} Date
          </button>
          <div style={tooltipContainerStyles} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
            <div className="mt-1 ml-1">
              <box-icon name="info-circle" type="solid" color="#5A67D8" size="20px"></box-icon>
            </div>
            <span className="tooltip-text" style={tooltipTextStyles}>
              Filter cases by their filing or decision dates
            </span>
          </div>
        </div>
        {isDataExpanded && (
          <div>
            <div className="flex flex-col gap-1">
              {years.map((year) => (
                <div className="mx-4" key={year}>
                  <input
                    className="custom-checkbox"
                    type="checkbox"
                    id={`date-${year}`}
                    value={year}
                    onChange={handleChange("date")}
                  />
                  <label htmlFor={`date-${year}`} className="ml-2">
                    {year}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <button className="font-bold text-[#5a67d8]" onClick={() => setIsPartiesExpanded(!isPartiesExpanded)}>
            {isPartiesExpanded ? "v" : ">"} Party
          </button>
          <div style={tooltipContainerStyles} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
            <div className="mt-2 ml-1">
              <box-icon name="info-circle" type="solid" color="#5A67D8" size="20px"></box-icon>
            </div>
            <span className="tooltip-text" style={tooltipTextStyles}>
              Filter cases by the involved parties
            </span>
          </div>
        </div>
        {isPartiesExpanded && (
          <div>
            <div className="flex flex-col gap-1">
              {(showMoreParties ? parties : parties.slice(0, 7)).map((party) => (
                <div className="mx-4" key={party}>
                  <input
                    className="custom-checkbox"
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
              {parties.length > 7 && (
                <button
                  className="mx-4 flex justify-start font-bold text-[#5a67d8]"
                  onClick={() => setShowMoreParties(!showMoreParties)}
                >
                  {showMoreParties ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <button className="font-bold text-[#5a67d8]" onClick={() => setIsJudgesExpanded(!isJudgesExpanded)}>
            {isJudgesExpanded ? "v" : ">"} Judge
          </button>
          <div style={tooltipContainerStyles} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
            <div className="mt-2 ml-1">
              <box-icon name="info-circle" type="solid" color="#5A67D8" size="20px"></box-icon>
            </div>
            <span className="tooltip-text" style={tooltipTextStyles}>
              Filter cases by the presiding judge
            </span>
          </div>
        </div>
        {isJudgesExpanded && (
          <div>
            <div className="flex flex-col gap-1">
              {(showMoreJudges ? judges : judges.slice(0, 7)).map((judge) => (
                <div className="mx-4" key={judge}>
                  <input
                    className="custom-checkbox"
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
              {judges.length > 7 && (
                <button
                  className="mx-4 flex justify-start font-bold text-[#5a67d8]"
                  onClick={() => setShowMoreJudges(!showMoreJudges)}
                >
                  {showMoreJudges ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
