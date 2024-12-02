import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const LandingSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [dateRange, setDateRange] = useState([null, null]); // Start and End date
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [selectedParam, setSelectedParam] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("");

  const [startDate, endDate] = dateRange; // Destructure date range

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile);
    }
  };

  const handleSendClick = () => {
    navigate("/results", {
      state: {
        query,
        selectedSearch,
        selectedParam,
        selectedSpace,
        file,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="m-4 text-5xl font-bold text-gray-800">AI-Powered Research Assistant</h1>
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-4 flex flex-col ">
        <div className="border border-gray-300 rounded-lg">
          <input
            type="text"
            placeholder="What is Commercial Courts Act, 2015?"
            className="w-full p-4 mb-2 rounded-lg text-lg focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex justify-between px-2 pb-2">
            <div className="">
              <div className="flex justify-between items-center">
                <i className="bx bx-globe bx-sm"></i>
                <select
                  value={selectedSearch}
                  onChange={(e) => {
                    setSelectedSearch(e.target.value);
                    setSelectedParam("");
                    setSelectedSpace("");
                  }}
                  className="bg-white rounded-sm mx-2 py-1"
                >
                  <option value="">Select Search Type</option>
                  <option value="Semantic Search">Semantic Search</option>
                  <option value="Entity Search">Entity Search</option>
                </select>
                {selectedSearch === "Entity Search" && (
                  <select
                    value={selectedParam}
                    onChange={(e) => setSelectedParam(e.target.value)}
                    className="bg-white rounded-sm mx-2 py-1"
                  >
                    <option value="">Select Entity</option>
                    <option value="lawyer">Search for lawyer names</option>
                    <option value="judge">Search for judge names</option>
                    <option value="gpe">Search for geographical entities (e.g., countries, cities)</option>
                    <option value="court">Search for the court name</option>
                    <option value="org">Search for organization names</option>
                    <option value="petitioner">Search for the petitioner name</option>
                    <option value="respondent">Search for the respondent name</option>
                    <option value="statute">Search for statutes or laws</option>
                  </select>
                )}
                {selectedSearch === "Semantic Search" && (
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="bg-white rounded-sm mx-2 py-1"
                  >
                    <option value="">Select Space</option>
                    <option value="all">Space:General</option>
                    <option value="judgements">Space:Issues</option>
                    <option value="orders">Space:Laws</option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex gap-2 mr-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <i className="bx bx-cloud-upload bx-sm"></i>
              </label>
              <i className="bx bx-send bx-sm cursor-pointer" onClick={handleSendClick}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSearch;
