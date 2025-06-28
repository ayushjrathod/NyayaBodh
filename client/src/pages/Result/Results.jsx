import { Button, Input } from "@nextui-org/react";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityResult from "../../components/Results/EntityResult";
import Filters from "../../components/Results/Filters";
import SemanticResult from "../../components/Results/SemanticResults";
import EnhancedLoader from "../../components/ui/EnhancedLoader";
import { apiConfig } from "../../config/api";

const Results = () => {
  const location = useLocation();

  const { query, selectedSearch } = location.state || {
    query: "",
    selectedSearch: "",
  };
  const searchType = selectedSearch.toLowerCase().split(" ")[0] || "entity";
  const [newQuery, setNewQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const inputRef = useRef();
  const [resultsData, setResultsData] = useState({});
  const [filteredResults, setFilteredResults] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    date: [],
    party: [],
    judge: [],
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
  }; // Apply filters to results
  useEffect(() => {
    let filtered =
      searchType === "semantic" ? resultsData.SemanticResultData || [] : resultsData.EntityResultData || [];

    // Ensure filtered is an array
    if (!Array.isArray(filtered)) {
      filtered = [];
    }

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
  }, [activeFilters, resultsData, searchType]);
  // Fetching results from API
  const fetchResults = useCallback(
    (query) => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      fetch(apiConfig.endpoints.search(searchType), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Stringify the body
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Received data:", data);
          // Check if the response indicates an error or no results
          if (data.detail && data.detail.includes("No matching results found")) {
            // Handle no results case
            setHasError(true);
            setErrorMessage("No matching results found for your query.");
            if (searchType === "semantic") {
              setResultsData({ SemanticResultData: [] });
            } else if (searchType === "entity") {
              setResultsData({ EntityResultData: [] });
            }
            return;
          }

          // Handle successful response with data
          if (searchType === "semantic") {
            setResultsData({
              SemanticResultData: Array.isArray(data.SemanticResultData) ? data.SemanticResultData : [],
            });
          } else if (searchType === "entity") {
            setResultsData({ EntityResultData: Array.isArray(data) ? data : [] });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setHasError(true);
          setErrorMessage("An error occurred while searching. Please try again.");
          // Set empty results on error
          if (searchType === "semantic") {
            setResultsData({ SemanticResultData: [] });
          } else if (searchType === "entity") {
            setResultsData({ EntityResultData: [] });
          }
        })
        .finally(() => {
          setIsLoading(false);
          setIsInitialLoad(false);
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
                  isDisabled={!newQuery.trim() || isLoading}
                  isLoading={isLoading}
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
          {/* Results */}
          <div className="">
            {isInitialLoad && isLoading ? (
              <div className="flex justify-center items-center py-16">
                <EnhancedLoader size="lg" label={`Searching ${searchType} results...`} center={true} />
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-8">
                <EnhancedLoader size="md" label="Updating results..." center={true} />
              </div>
            ) : hasError ? (
              <div className="flex flex-col justify-center items-center py-16 text-center">
                <div className="text-lg text-gray-600 mb-2">⚠️</div>
                <div className="text-lg font-medium text-gray-700 mb-1">No Results Found</div>
                <div className="text-sm text-gray-500">{errorMessage}</div>
                <div className="text-xs text-gray-400 mt-2">Try adjusting your search terms or filters</div>
              </div>
            ) : searchType === "semantic" ? (
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
