import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const HomeSearch = () => {
  const [query, setQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");
  const [dateRange, setDateRange] = useState([null, null]); // Start and End date
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

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
        jurisdiction: selectedJurisdiction,
        timeFrame: { startDate, endDate },
        file,
      },
    });
  };

  return (
    <div className="bg-purple-50 min-h-screen flex flex-col items-center justify-center px-4">
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
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="bg-white rounded-sm mx-2 py-1"
                >
                  <option value="">Jurisdiction</option>
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="District Court">District Court</option>
                </select>
                <div className="flex">
                  <div className="pt-[0.1rem]">
                    <i className="bx bx-calendar bx-sm"></i>
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={(update) => setDateRange(update)}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    placeholderText="Select Date Range"
                    className="outline-none rounded-sm mx-2 py-1"
                  />
                </div>
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

export default HomeSearch;
