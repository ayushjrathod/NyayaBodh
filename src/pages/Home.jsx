import { useEffect, useRef, useState } from "react";
//If the results.json is needed to be used, uncomment the next line
//import resultsData from "../../public/results.json";
import DisplayedResult from "../components/Home/DisplayedResult";
import Filters from "../components/Home/Filters";
import SpaceMenu from "../components/Home/SpaceMenu";

const Home = () => {
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [query, setQuery] = useState("");
  const [space, setSpace] = useState("Space: general");
  const [resultsData, setResultsData] = useState([]);
  const [filteredResults, setFilteredResults] = useState(resultsData);
  const [filters, setFilters] = useState({
    date: [],
    judge: [],
    party: [],
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const queryValue = inputRef.current.value;
    setQuery(queryValue);
    console.log(queryValue);

    fetch("http://0.0.0.0:8000/search", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: `${space} ${queryValue}` }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // If update results based on the search is to be used, uncomment the next line
        setFilteredResults(data);
        setResultsData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  const uploadPdf = () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

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
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prevFilters) => {
      const updatedFilter = checked
        ? [...prevFilters[filterType], value]
        : prevFilters[filterType].filter((item) => item !== value);
      return { ...prevFilters, [filterType]: updatedFilter };
    });
  };

  useEffect(() => {
    const filtered = resultsData.filter((result) => {
      const metadata = result.metadata;
      const yearMatch = metadata.match(/\[(\d{4})\]/);
      const judgeMatch = metadata.match(/\[(.*?)\]$/);
      const partyMatch = metadata.match(/^(.+?)\nv\.\n(.+?)$/m);

      const matchesDate = filters.date.length === 0 || (yearMatch && filters.date.includes(yearMatch[1]));

      const matchesJudge =
        filters.judge.length === 0 || (judgeMatch && filters.judge.some((judge) => judgeMatch[1].includes(judge)));

      const matchesParty =
        filters.party.length === 0 ||
        (partyMatch &&
          (filters.party.includes(partyMatch[1].trim()) ||
            filters.party.includes(partyMatch[2].split("\n")[0].trim())));

      return matchesDate && matchesJudge && matchesParty;
    });

    setFilteredResults(filtered);
  }, [filters]);

  return (
    <div className="flex justify-between m-2">
      <div className="h-screen w-1/6">
        <Filters onFilterChange={handleFilterChange} results={resultsData} />
      </div>
      <div className="h-fit border-l-2 w-5/6">
        <div className="bg-gray-200 rounded-lg flex justify-center w-full mx-1">
          <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex just">
            <input
              type="text"
              ref={inputRef}
              onKeyDown={handleKeyDown}
              placeholder="Enter your search query...."
              className="w-full border-none outline-none"
            />
            <div className="relative flex">
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={uploadPdf}
              />
              <button className="mx-4" onClick={() => fileInputRef.current.click()}>
                <i className="bx bx-cloud-upload bx-sm"></i>
              </button>
              <button className="mr-2" onClick={onSubmit}>
                <i className="bx bx-send bx-sm"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="mx-6">
          <div className="flex justify-between">
            <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Results</h1>
            <SpaceMenu space={space} setSpace={setSpace} />
          </div>
          <DisplayedResult results={filteredResults} />
        </div>
      </div>
    </div>
  );
};

export default Home;
