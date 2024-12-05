import { Button, Input } from "@nextui-org/react";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityResultData from "../../../public/EntityResult.json";
import SemanticResultData from "../../../public/SemanticResult.json";
import EntityResult from "../../components/Results/EntityResult";
import Filters from "../../components/Results/Filters";
import SemanticResult from "../../components/Results/SemanticResults";

const Results = () => {
  const location = useLocation();

  const { query, selectedSearch, selectedSpace, selectedParam, SelectedFile } = location.state || {
    query: "",
    selectedSearch: "",
    selectedSpace: "",
    selectedParam: "",
    SelectedFile: "",
  };

  const searchType = selectedSearch.toLowerCase().split(" ")[0] || "semantic";
  const [newQuery, setNewQuery] = useState(query);
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [space, setSpace] = useState(selectedSpace);

  const [filters, setFilters] = useState({
    category: [],
    date: "",
    party: "",
    judge: "",
  });

  //const [resultsData, setResultsData] = useState([]);  //for using api call
  const [resultsData, setResultsData] = useState(searchType === "semantic" ? SemanticResultData : EntityResultData); //for using static data

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
    let filtered = resultsData[searchType === "semantic" ? "SemanticResultData" : "EntityResultData"] || [];

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

  //on submitting new query
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newQuery) {
      fetchResults(newQuery);
    }
  };

  //fetching results from api
  const fetchResults = (query) => {
    fetch(`http://0.0.0.0:8000/search/${searchType}`, {
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

  //fetching results on page load
  useEffect(() => {
    if (query) {
      fetchResults(query);
    }
  }, []);

  useEffect(() => {
    if (SelectedFile) {
      const formData = new FormData();
      formData.append("pdf", SelectedFile);

      fetch("/upload", {
        method: "POST",
        mode: "cors",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          alert("File uploaded successfully");
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          alert("Error uploading file");
        });
    }
  }, [SelectedFile]);

  return (
    <div className="min-h-screen bg-background pb-4 font-Inter text-foreground">
      <div className="h-fit w-fit rounded-3xl ">
        <div className="flex justify-center m-4">
          <form onSubmit={handleSubmit} className="w-full">
            <Input
              ref={inputRef}
              placeholder="Ask a follow-up question..."
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
