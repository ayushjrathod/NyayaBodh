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
    const uniqueJudges = new Set();
    const uniqueParties = new Set();
    const uniqueYears = new Set();

    results.forEach((result) => {
      if (result.JUDGE) {
        result.JUDGE.split(",").forEach((judge) => uniqueJudges.add(judge.trim()));
      }

      if (result.PETITIONER) uniqueParties.add(result.PETITIONER.trim());
      if (result.RESPONDENT) uniqueParties.add(result.RESPONDENT.trim());

      if (result.DATE) {
        const yearMatch = result.DATE.match(/\d{4}/);
        if (yearMatch) uniqueYears.add(yearMatch[0]);
      }
    });

    setJudges(Array.from(uniqueJudges));
    setParties(Array.from(uniqueParties));
    setYears(Array.from(uniqueYears).sort((a, b) => b - a));
  }, [results]);

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
    <Card className="sticky top-[5rem]">
      <CardBody>
        <aside className="p-4">
          <h2 className="text-xl font-bold mb-4" > Filters</h2 >
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
        </aside >
      </CardBody >
    </Card >
  );
};

export default Filters;
