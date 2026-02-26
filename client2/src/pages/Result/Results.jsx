import { Button, Input } from "@nextui-org/react";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EntityResult from "../../components/Results/EntityResult";
import Filters from "../../components/Results/Filters";
import SemanticResult from "../../components/Results/SemanticResults";
import { SkeletonLoader, EmptyState, useToast } from "../../components/ui";
import { apiConfig } from "../../config/api";

// Search cache to persist results
const searchCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get search params from URL or location state
  const urlParams = new URLSearchParams(location.search);
  const urlQuery = urlParams.get('q');
  const urlSearchType = urlParams.get('type');
  
  const { query: stateQuery, selectedSearch } = location.state || {};
  
  // Use URL params if available, otherwise fall back to location state
  const initialQuery = urlQuery || stateQuery || "";
  const initialSearchType = urlSearchType || (selectedSearch?.toLowerCase().split(" ")[0]) || "entity";

  const [newQuery, setNewQuery] = useState(initialQuery);
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
  const [currentSearchType, setCurrentSearchType] = useState(initialSearchType);

  // Generate cache key
  const getCacheKey = (query, searchType) => `${searchType}:${query.toLowerCase().trim()}`;

  // Update URL with search parameters
  const updateURL = useCallback((query, searchType) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchType) params.set('type', searchType);
    
    const newURL = `${location.pathname}?${params.toString()}`;
    navigate(newURL, { replace: true, state: { query, selectedSearch: searchType } });
  }, [location.pathname, navigate]);

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
      currentSearchType === "semantic" ? resultsData.SemanticResultData || [] : resultsData.EntityResultData || [];

    // Ensure filtered is an array
    if (!Array.isArray(filtered)) {
      filtered = [];
    }

    filtered = filtered.filter((item) => {
      if (currentSearchType === "semantic") {
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
  }, [activeFilters, resultsData, currentSearchType]);

  // Fetching results from API with caching
  const fetchResults = useCallback(
    (query, searchType = currentSearchType, useCache = true) => {
      if (!query.trim()) return;

      const cacheKey = getCacheKey(query, searchType);
      
      // Check cache first
      if (useCache && searchCache.has(cacheKey)) {
        const cached = searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('Using cached results for:', cacheKey);
          setResultsData(cached.data);
          setHasError(false);
          setErrorMessage("");
          setIsLoading(false);
          setIsInitialLoad(false);
          toast.success(`Loaded cached results for "${query}"`);
          return;
        } else {
          // Remove expired cache
          searchCache.delete(cacheKey);
        }
      }

      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      fetch(apiConfig.endpoints.search(searchType), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
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
            setHasError(true);
            setErrorMessage("No matching results found for your query.");
            if (searchType === "semantic") {
              setResultsData({ SemanticResultData: [] });
            } else if (searchType === "entity") {
              setResultsData({ EntityResultData: [] });
            }
            toast.info("No results found. Try adjusting your search terms.");
            return;
          }

          // Handle successful response with data
          let resultsToCache = {};
          if (searchType === "semantic") {
            const results = Array.isArray(data.SemanticResultData) ? data.SemanticResultData : [];
            resultsToCache = { SemanticResultData: results };
            setResultsData(resultsToCache);
            if (results.length > 0) {
              toast.success(`Found ${results.length} semantic search results`);
            }
          } else if (searchType === "entity") {
            const results = Array.isArray(data) ? data : [];
            resultsToCache = { EntityResultData: results };
            setResultsData(resultsToCache);
            if (results.length > 0) {
              toast.success(`Found ${results.length} entity search results`);
            }
          }

          // Cache the results
          searchCache.set(cacheKey, {
            data: resultsToCache,
            timestamp: Date.now()
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          setHasError(true);
          setErrorMessage("An error occurred while searching. Please try again.");
          toast.error("Search failed. Please check your connection and try again.");
          
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
    [currentSearchType, toast]
  );

  // Fetching results on page load
  useEffect(() => {
    if (initialQuery) {
      setCurrentSearchType(initialSearchType);
      fetchResults(initialQuery, initialSearchType);
      // Update URL to ensure consistency
      updateURL(initialQuery, initialSearchType);
    }
  }, []); // Only run once on mount

  // On submitting new query
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newQuery.trim()) {
      // Clear filters when performing new search
      setActiveFilters({ date: [], party: [], judge: [] });
      fetchResults(newQuery, currentSearchType, false); // Don't use cache for new searches
      updateURL(newQuery, currentSearchType);
      toast.loading("Searching...");
    }
  };

  const currentResults = currentSearchType === "semantic" 
    ? (filteredResults.length > 0 ? filteredResults : resultsData.SemanticResultData || [])
    : (filteredResults.length > 0 ? filteredResults : resultsData.EntityResultData || []);

  return (
    <div className="min-h-screen bg-background pb-4 font-Inter text-foreground">
      <div className="h-fit w-fit rounded-3xl">
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
          <div className="mt-4">
            <Filters
              onFilterChange={handleFilterChange}
              results={currentResults}
              searchType={currentSearchType}
            />
          </div>

          {/* Results */}
          <div className="">
            {isInitialLoad && isLoading ? (
              <div className="space-y-4">
                <SkeletonLoader 
                  type="search-result" 
                  count={3} 
                  className="animate-pulse" 
                />
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <SkeletonLoader 
                  type="search-result" 
                  count={2} 
                  className="animate-pulse" 
                />
              </div>
            ) : hasError || currentResults.length === 0 ? (
              <EmptyState
                type="search"
                title={hasError ? "Search Error" : "No Results Found"}
                description={
                  hasError 
                    ? errorMessage 
                    : `No ${currentSearchType} results found for "${newQuery || initialQuery}". Try different keywords or adjust your filters.`
                }
                actionLabel="Clear Filters"
                onAction={() => {
                  setActiveFilters({ date: [], party: [], judge: [] });
                  if (hasError) {
                    fetchResults(newQuery || initialQuery, currentSearchType, false);
                  }
                }}
                size="md"
              />
            ) : currentSearchType === "semantic" ? (
              <SemanticResult
                resultsData={currentResults}
                searchType={currentSearchType}
              />
            ) : (
              <EntityResult
                resultsData={currentResults}
                searchType={currentSearchType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;