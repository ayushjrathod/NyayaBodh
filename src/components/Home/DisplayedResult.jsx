import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DisplayedResult = ({ results }) => {
  const [filteredResults, setFilteredResults] = useState(results);
  const [filters, setFilters] = useState({ date: [], judge: [], party: [] });
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfPath, setPdfPath] = useState("");
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    applyFilters();
  }, [filters, results]);

  const applyFilters = () => {
    let filtered = results;

    if (filters.date.length > 0) {
      filtered = filtered.filter((result) => {
        const yearMatch = result.metadata.match(/\[(\d{4})\]/);
        return yearMatch && filters.date.includes(yearMatch[1]);
      });
    }

    if (filters.judge.length > 0) {
      filtered = filtered.filter((result) => {
        const judgeMatch = result.metadata.match(/\[(.*?)\]$/);
        return judgeMatch && filters.judge.some((judge) => judgeMatch[1].includes(judge));
      });
    }

    if (filters.party.length > 0) {
      filtered = filtered.filter((result) => {
        const partyMatch = result.metadata.match(/^(.+?)\nv\.\n(.+?)$/m);
        return (
          partyMatch &&
          (filters.party.includes(partyMatch[1].trim()) || filters.party.includes(partyMatch[2].split("\n")[0].trim()))
        );
      });
    }

    setFilteredResults(filtered);
  };

  const togglePopover = (e, id) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    setPopoverPosition({ top: rect.bottom, left: rect.left - 150 });
    setPopoverVisible(!popoverVisible);
    setSelectedId(id);
  };

  const openPdfInFloatingDiv = () => {
    console.log("Opening PDF with path:", selectedPdf);
    setPdfPath(selectedPdf);
    setPdfVisible(true);
  };

  const closePdf = () => {
    setPdfVisible(false);
    setPdfPath("");
  };

  const extractParties = (metadata) => {
    const match = metadata.match(/(.+)\nv\.\n(.+)/);
    if (match) {
      return `${match[1].trim()} v. ${match[2].split("\n")[0].trim()}`;
    }
    return "Unable to extract party names";
  };

  const handleTitleClick = (e) => {
    navigate(`/pages/${e.target.innerText}`);
  };
  const handelOpenPdfcall = (currentID) => {
    fetch("http://127.0.0.1:8000/get-file", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: currentID }),
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(currentID);
        console.log(res);
        const blob = res.blob;
        const url = window.URL.createObjectURL(blob);
        setSelectedPdf(url);
        //(might work) if you want to open pdf in floating div -> a popup window -> uncomment the below line
        //also uncomment line 119 to 128 and comment line 129 to 131
        //openPdfInFloatingDiv();
        window.open(selectedPdf, "_blank");
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  return (
    <div className="flex-1">
      <div>
        {filteredResults.map((result) => (
          <div key={result.id} className="my-4 mx-2 px-4 py-2 border-b-2 w-full">
            <div className="flex justify-between">
              <button onClick={handleTitleClick} className="font-roboto tracking-wide font-semibold text-base mb-2">
                {extractParties(result.metadata)}
              </button>
              <div className="cursor-pointer" onClick={(e) => togglePopover(e, result.id)}>
                <img src="../src/assets/pdfIcon.png" className="w-6 h-6" />
              </div>
            </div>
            {popoverVisible && selectedId === result.id && (
              <div
                className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                style={{
                  top: popoverPosition.top,
                  left: popoverPosition.left,
                }}
              >
                <ul className="py-2">
                  {/* <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPdf(result.pdf);
                      openPdfInFloatingDiv();
                    }}
                  >
                    Open PDF
                  </li> */}
                  <a onClick={handelOpenPdfcall(result.id)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Open PDF
                  </a>
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to={`/chatbot/${result.id}`}>Open PDF in Chatbot</Link>
                  </li>
                </ul>
              </div>
            )}
            <p className="font-roboto tracking-wide text-gray-800">{result.description}</p>
          </div>
        ))}
      </div>
      {pdfVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white w-3/4 h-3/4 rounded-lg overflow-hidden">
            <button className="absolute top-2 left-2 text-gray-600 bg-white hover:text-gray-800" onClick={closePdf}>
              <i className="bx bx-window-close bx-sm"></i>
            </button>
            <iframe src={pdfPath} className="w-full h-full"></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayedResult;
