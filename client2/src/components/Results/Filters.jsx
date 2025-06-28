import { Accordion, AccordionItem, Card, CardBody, Checkbox } from "@nextui-org/react";
import PropTypes from "prop-types";
import { useEffect, useState, useMemo, memo } from "react";

const Filters = memo(({ onFilterChange, results, searchType }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    date: [],
    party: [],
    judge: [],
  });

  // Memoize the extraction of filter options to prevent recalculation
  const filterOptions = useMemo(() => {
    // Ensure results is an array before processing
    if (!Array.isArray(results)) {
      return {
        judges: [],
        parties: [],
        years: [],
      };
    }

    const uniqueJudges = new Set();
    const uniqueParties = new Set();
    const uniqueYears = new Set();

    results.forEach((result) => {
      if (searchType === "semantic") {
        // For semantic results, use metadata structure
        const metadata = result.metadata || {};

        if (metadata.JUDGE && typeof metadata.JUDGE === "string") {
          metadata.JUDGE.split(",").forEach((judge) => uniqueJudges.add(judge.trim()));
        } else if (metadata.JUDGE) {
          uniqueJudges.add(String(metadata.JUDGE).trim());
        }

        if (metadata.PETITIONER && typeof metadata.PETITIONER === "string") {
          uniqueParties.add(metadata.PETITIONER.trim());
        } else if (metadata.PETITIONER) {
          uniqueParties.add(String(metadata.PETITIONER).trim());
        }

        if (metadata.RESPONDENT && typeof metadata.RESPONDENT === "string") {
          uniqueParties.add(metadata.RESPONDENT.trim());
        } else if (metadata.RESPONDENT) {
          uniqueParties.add(String(metadata.RESPONDENT).trim());
        }

        if (metadata.DATE && typeof metadata.DATE === "string") {
          const yearMatch = metadata.DATE.match(/\d{4}/);
          if (yearMatch) uniqueYears.add(yearMatch[0]);
        } else if (metadata.DATE) {
          const dateString = String(metadata.DATE);
          const yearMatch = dateString.match(/\d{4}/);
          if (yearMatch) uniqueYears.add(yearMatch[0]);
        }
      } else {
        // For entity results, extract from different properties

        // Extract judges from summary if available
        if (result.summary) {
          const judgeMatches = result.summary.match(/Judge[s]?:\s*([^.]+)/gi);
          if (judgeMatches) {
            judgeMatches.forEach((match) => {
              const judge = match.replace(/Judge[s]?:\s*/i, "").trim();
              if (judge) uniqueJudges.add(judge);
            });
          }
        }

        // Add petitioner and respondent
        if (result.petitioner) {
          result.petitioner.split(",").forEach((party) => uniqueParties.add(party.trim()));
        }
        if (result.respondent) {
          result.respondent.split(",").forEach((party) => uniqueParties.add(party.trim()));
        }

        // Add entities
        if (result.entities) {
          result.entities.split(",").forEach((entity) => uniqueParties.add(entity.trim()));
        }

        // Extract years from summary
        if (result.summary) {
          const yearMatches = result.summary.match(/\b(19|20)\d{2}\b/g);
          if (yearMatches) {
            yearMatches.forEach((year) => uniqueYears.add(year));
          }
        }
      }
    });

    return {
      judges: Array.from(uniqueJudges),
      parties: Array.from(uniqueParties),
      years: Array.from(uniqueYears).sort((a, b) => b - a),
    };
  }, [results, searchType]);

  const { judges, parties, years } = filterOptions;

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
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <Accordion>
            <AccordionItem key="date" aria-label="Date" title="Date">
              <div className="flex flex-col gap-2">
                {years.map((year) => (
                  <FilterCheckbox
                    key={year}
                    value={year}
                    label={year}
                    isSelected={selectedFilters.date.includes(year)}
                    onChange={() => handleFilterChange("date", year)}
                  />
                ))}
              </div>
            </AccordionItem>

            <AccordionItem key="party" aria-label="Party" title="Party">
              <div className="flex flex-col gap-2">
                {parties.map((party) => (
                  <FilterCheckbox
                    key={party}
                    value={party}
                    label={party}
                    isSelected={selectedFilters.party.includes(party)}
                    onChange={() => handleFilterChange("party", party)}
                  />
                ))}
              </div>
            </AccordionItem>

            <AccordionItem key="judge" aria-label="Judge" title="Judge">
              <div className="flex flex-col gap-2">
                {judges.map((judge) => (
                  <FilterCheckbox
                    key={judge}
                    value={judge}
                    label={judge}
                    isSelected={selectedFilters.judge.includes(judge)}
                    onChange={() => handleFilterChange("judge", judge)}
                  />
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        </aside>
      </CardBody>
    </Card>
  );
});

// Memoized checkbox component to prevent unnecessary re-renders
const FilterCheckbox = memo(({ value, label, isSelected, onChange }) => (
  <Checkbox
    value={value}
    isSelected={isSelected}
    onValueChange={onChange}
  >
    {label}
  </Checkbox>
));

FilterCheckbox.displayName = "FilterCheckbox";
Filters.displayName = "Filters";

FilterCheckbox.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

Filters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  searchType: PropTypes.string.isRequired,
};

export default Filters;