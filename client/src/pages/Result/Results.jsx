import { Button, Input } from "@nextui-org/react";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityResultData from "../../../public/EntityResult.json"; //comment this while using api
import SemanticResultData from "../../../public/SemanticResult.json"; //comment this while using api
import EntityResult from "../../components/Results/EntityResult";
import Filters from "../../components/Results/Filters";
import SemanticResult from "../../components/Results/SemanticResults";
import { useTranslation } from 'react-i18next';
import { useSelector } from "react-redux";


const Results = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const { query, selectedSearch, selectedSpace, selectedParam } = location.state || {
    query: "",
    selectedSearch: "",
    selectedSpace: "",
    selectedParam: "",
    SelectedFile: "",
  };

  const searchType = selectedSearch.toLowerCase().split(" ")[0] || "semantic";
  const [newQuery, setNewQuery] = useState(query);
  const inputRef = useRef();
  const [space, setSpace] = useState(selectedSpace);

  //const [resultsData, setResultsData] = useState([]);  //uncomment this while using api
  const [resultsData, setResultsData] = useState(searchType === "semantic" ? SemanticResultData : EntityResultData); //comment this while using api

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
    let filtered = resultsData[searchType === "semantic" ? "SemanticResultData" : "EntityResultData"] || []; //comment this while using api

    if (searchType === "semantic") {
      // Apply semantic search filters
      filtered = filtered.filter((item) => {
        const metadata = item.metadata;
        const passes = {
          date: !activeFilters.date.length || activeFilters.date.some((year) => metadata.includes(year)),
          party: !activeFilters.party.length || activeFilters.party.some((party) => metadata.includes(party)),
          judge: !activeFilters.judge.length || activeFilters.judge.some((judge) => metadata.includes(judge)),
        };
        return passes.date && passes.party && passes.judge;
      });
    } else {
      // Apply entity search filters
      filtered = filtered.filter((item) => {
        const passes = {
          date: !activeFilters.date.length || activeFilters.date.includes(item.date),
          party: !activeFilters.party.length || activeFilters.party.some((party) => item.entities.includes(party)),
          judge: !activeFilters.judge.length || activeFilters.judge.includes(item.judge),
        };
        return passes.date && passes.party && passes.judge;
      });
    }

    setFilteredResults(filtered);
  }, [activeFilters, resultsData, searchType]);

  //fetching results from api
  const fetchResults = (query) => {
    fetch(`http://localhost:8000/search/${searchType}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body:
        searchType === "semantic"
          ? JSON.stringify({ query, param: selectedParam })
          : JSON.stringify({ query: `${space} ${query}` }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResultsData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  //uncomment while using api
  //fetching results on page load
  // useEffect(() => {
  //   if (query) {
  //     fetchResults(query);
  //   }
  // }, []);

  //on submitting new query
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
              results={resultsData[searchType === "semantic" ? "SemanticResultData" : "EntityResultData"] || []}
              searchType={searchType}
            />
          </div>

          {/* Results */}
          <div className="">
            {searchType === "semantic" ? (
              <SemanticResult resultsData={{ SemanticResultData: filteredResults }} />
            ) : (
              <EntityResult resultsData={{ EntityResultData: filteredResults }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
