import { Accordion, AccordionItem, Card, CardBody, Checkbox } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

const Filters = ({ onFilterChange, results, searchType }) => {
  const [judges, setJudges] = useState([]);
  const [parties, setParties] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    date: [],
    party: [],
    judge: [],
  });

  useEffect(() => {
    if (searchType === "semantic") {
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
      setYears(Array.from(uniqueYears).sort((a, b) => b - a));
    } else {
      const uniqueJudges = new Set(results.map((item) => item.judge));
      const uniqueParties = new Set(results.flatMap((item) => item.entities.split(", ")));
      const uniqueYears = new Set(results.map((item) => new Date(item.date).getFullYear().toString()));

      setJudges(Array.from(uniqueJudges));
      setParties(Array.from(uniqueParties));
      setYears(Array.from(uniqueYears).sort((a, b) => b - a));
    }
  }, [results, searchType]);

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const index = newFilters[type].indexOf(value);

      if (index === -1) {
        newFilters[type] = [...newFilters[type], value];
      } else {
        newFilters[type] = newFilters[type].filter((item) => item !== value);
      }

      return newFilters;
    });
    onFilterChange(type, value, !selectedFilters[type].includes(value));
  };

  return (
    <Card className="col-span-1 mt-4">
      <CardBody>
        <aside className="p-4">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <Accordion>
            <AccordionItem key="date" aria-label="Date" title="Date">
              <div className="flex flex-col gap-2">
                {years.map((year) => (
                  <Checkbox
                    key={year}
                    value={year}
                    isSelected={selectedFilters.date.includes(year)}
                    onValueChange={() => handleFilterChange("date", year)}
                  >
                    {year}
                  </Checkbox>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem key="party" aria-label="Party" title="Party">
              <div className="flex flex-col gap-2">
                {parties.map((party) => (
                  <Checkbox
                    key={party}
                    value={party}
                    isSelected={selectedFilters.party.includes(party)}
                    onValueChange={() => handleFilterChange("party", party)}
                  >
                    {party}
                  </Checkbox>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem key="judge" aria-label="Judge" title="Judge">
              <div className="flex flex-col gap-2">
                {judges.map((judge) => (
                  <Checkbox
                    key={judge}
                    value={judge}
                    isSelected={selectedFilters.judge.includes(judge)}
                    onValueChange={() => handleFilterChange("judge", judge)}
                  >
                    {judge}
                  </Checkbox>
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        </aside>
      </CardBody>
    </Card>
  );
};

export default Filters;
