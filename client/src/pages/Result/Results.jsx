import { Button, Input } from "@nextui-org/react";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityResult from "../../components/Results/EntityResult";
import Filters from "../../components/Results/Filters";
import SemanticResult from "../../components/Results/SemanticResults";
import { apiConfig } from "../../config/api";

const Results = () => {
  const location = useLocation();

  const { query, selectedSearch } = location.state || {
    query: "",
    selectedSearch: "",
  };

  const searchType = selectedSearch.toLowerCase().split(" ")[0] || "entity";
  const [newQuery, setNewQuery] = useState(query);

  const inputRef = useRef();

  const [resultsData, setResultsData] = useState({});
  const [filteredResults, setFilteredResults] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    date: [],
    party: [],
    judge: [],
  });

  // Handle filter changes
  const handleFilterChange = (filterType, value, checked) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (checked) {
        newFilters[filterType] = [...prev[filterType], value];
      } else {
        newFilters[filterType] = prev[filterType].filter((item) => item !== value);
      }
      return newFilters;
    });
  };
  // Apply filters to results
  useEffect(() => {
    let filtered =
      searchType === "semantic" ? resultsData.SemanticResultData || [] : resultsData.EntityResultData || [];

    filtered = filtered.filter((item) => {
      if (searchType === "semantic") {
        // For semantic results, use metadata structure
        const metadata = item.metadata || {};
        return (
          (!activeFilters.date.length || activeFilters.date.some((year) => metadata.DATE?.includes(year))) &&
          (!activeFilters.party.length ||
            activeFilters.party.some(
              (party) => metadata.PETITIONER?.includes(party) || metadata.RESPONDENT?.includes(party)
            )) &&
          (!activeFilters.judge.length || activeFilters.judge.some((judge) => metadata.JUDGE?.includes(judge)))
        );
      } else {
        // For entity results, use direct properties
        return (
          (!activeFilters.date.length || activeFilters.date.some((year) => item.summary?.includes(year))) &&
          (!activeFilters.party.length ||
            activeFilters.party.some(
              (party) =>
                item.petitioner?.includes(party) || item.respondent?.includes(party) || item.entities?.includes(party)
            )) &&
          (!activeFilters.judge.length || activeFilters.judge.some((judge) => item.summary?.includes(judge)))
        );
      }
    });

    setFilteredResults(filtered);
  }, [activeFilters, resultsData, searchType]); // Fetching results from API
  const fetchResults = useCallback(
    (query) => {
      fetch(apiConfig.endpoints.search(searchType), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Stringify the body
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Received data:", data);
          if (searchType === "semantic") {
            setResultsData({ SemanticResultData: data.SemanticResultData });
          } else if (searchType === "entity") {
            setResultsData({ EntityResultData: data });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    [searchType]
  ); // Fetching results on page load
  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, [query, fetchResults]);

  // On submitting new query
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newQuery) {
      fetchResults(newQuery);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-4 font-Inter text-foreground">
      <div className="h-fit w-fit rounded-3xl ">
        <div className="flex justify-center m-4">
          <form onSubmit={handleSubmit} className="w-full">
            <Input
              ref={inputRef}
              placeholder="Enter a new Query..."
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              className=""
              endContent={
                <Button
                  className="size-1"
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="primary"
                  onClick={handleSubmit}
                  isDisabled={!newQuery.trim()}
                >
                  <Send className="size-4" />
                </Button>
              }
            />
          </form>
        </div>
        <div className="grid px-4 gap-4 grid-cols-[1fr_3fr]">
          {/* Left sidebar for filters */}
          <div className=" mt-4">
            <Filters
              onFilterChange={handleFilterChange}
              results={
                searchType === "semantic" ? resultsData.SemanticResultData || [] : resultsData.EntityResultData || []
              }
              searchType={searchType}
            />
          </div>{" "}
          {/* Results */}{" "}
          <div className="">
            {searchType === "semantic" ? (
              <SemanticResult
                resultsData={filteredResults.length > 0 ? filteredResults : resultsData.SemanticResultData || []}
                searchType={searchType}
              />
            ) : (
              <EntityResult
                resultsData={filteredResults.length > 0 ? filteredResults : resultsData.EntityResultData || []}
                searchType={searchType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
