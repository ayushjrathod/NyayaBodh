import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EntityData from "../../public/EntityResult.json";
import SemanticData from "../../public/SemanticResult.json";
import EntityResult from "../components/Results/EntityResult";
import SemanticResult from "../components/Results/SemanticResults";
import SpaceMenu from "../components/Results/SpaceMenu";

const Results = () => {
  const location = useLocation();
  const { query, selectedSearch, selectedSpace, selectedParam, file } = location.state || {};
  const searchType = selectedSearch.toLowerCase().split(" ")[0] || "semantic";
  const [newQuery, setNewQuery] = useState(query);
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [space, setSpace] = useState(selectedSpace);
  // const [resultsData, setResultsData] = useState([]);
  const [resultsData, setResultsData] = useState(searchType === "semantic" ? SemanticData : EntityData);
  const [filteredResults, setFilteredResults] = useState(SemanticData);
  const [filters, setFilters] = useState({
    date: [],
    judge: [],
    party: [],
  });

  useEffect(() => {
    if (query) {
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
          if (searchType === "semantic") {
            setResultsData(data);
            setFilteredResults(data);
          } else {
            setResultsData(data);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [query]);

  useEffect(() => {
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);

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
  }, [file]);

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prevFilters) => {
      const updatedFilter = checked
        ? [...prevFilters[filterType], value]
        : prevFilters[filterType].filter((item) => item !== value);
      return { ...prevFilters, [filterType]: updatedFilter };
    });
  };

  // useEffect(() => {
  //   const filtered = resultsData.filter((result) => {
  //     const metadata = result.metadata;
  //     const yearMatch = metadata.match(/\[(\d{4})\]/);
  //     const judgeMatch = metadata.match(/\[(.*?)\]$/);
  //     const partyMatch = metadata.match(/^(.+?)\nv\.\n(.+?)$/m);

  //     const matchesDate = filters.date.length === 0 || (yearMatch && filters.date.includes(yearMatch[1]));

  //     const matchesJudge =
  //       filters.judge.length === 0 || (judgeMatch && filters.judge.some((judge) => judgeMatch[1].includes(judge)));

  //     const matchesParty =
  //       filters.party.length === 0 ||
  //       (partyMatch &&
  //         (filters.party.includes(partyMatch[1].trim()) ||
  //           filters.party.includes(partyMatch[2].split("\n")[0].trim())));

  //     return matchesDate && matchesJudge && matchesParty;
  //   });

  //   setFilteredResults(filtered);
  // }, [filters]);

  return (
    <div className="flex justify-between m-2">
      <div className="h-screen w-1/6 ml-8 mt-4">
        <p className="text-xl font-bold mb-2">Filter By</p>
        {/* <Filters onFilterChange={handleFilterChange} results={resultsData} /> */}
      </div>
      <div className="h-fit w-5/6 border-2 rounded-3xl mr-8">
        <div className="flex w-full mx-1">
          <div className="w-full p-2 m-2 flex justify-between">
            <input
              type="text"
              ref={inputRef}
              placeholder="Enter your search query...."
              className="w-1/2 border-none outline-none"
              value={newQuery}
              onChange={(e) => {
                setNewQuery(e.target.value);
              }}
            />
            <div className="relative flex">
              <SpaceMenu className="" space={space} setSpace={setSpace} />
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={() => {}}
              />
              <button className="mx-4" onClick={() => fileInputRef.current.click()}>
                <i className="bx bx-cloud-upload bx-sm"></i>
              </button>
              <button className="mr-2" onClick={() => {}}>
                <i className="bx bx-send bx-sm"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="mx-6">
          <div className="flex justify-between">
            <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Results</h1>
          </div>
          {searchType === "semantic" ? (
            <SemanticResult results={filteredResults} />
          ) : (
            <EntityResult EntityResultData={resultsData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
