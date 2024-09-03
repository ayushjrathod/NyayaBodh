import { useState } from "react";
import { Link } from "react-router-dom";

const DisplayedResult = ({ results }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfPath, setPdfPath] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(""); // New state variable
  const [selectedId, setSelectedId] = useState(null); // State to store selected id

  const togglePopover = (e, id) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    setPopoverPosition({ top: rect.bottom, left: rect.left - 150 });
    setPopoverVisible(!popoverVisible);
    setSelectedId(id); // Set the selected id
  };

  const openPdfInFloatingDiv = () => {
    console.log("Opening PDF with path:", selectedPdf); // Debugging log
    setPdfPath(selectedPdf);
    setPdfVisible(true);
  };

  const closePdf = () => {
    setPdfVisible(false);
    setPdfPath("");
  };

  return (
    <div className="flex-1">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">
        Results
      </h1>
      <div>
        {results.map((result) => (
          <div
            key={result.id}
            className="border-2 bg-slate-200 rounded-lg my-4 mx-2 px-4 py-2"
          >
            <div className="flex justify-between">
              <h2 className="font-roboto tracking-wide font-semibold">
                {result.title}
              </h2>
              <div
                className="cursor-pointer"
                onClick={(e) => togglePopover(e, result.id)}
              >
                <i className="bx bxs-file-pdf bx-sm"></i>
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
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedPdf(result.pdf);
                      openPdfInFloatingDiv();
                    }}
                  >
                    Open PDF
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to={`/chatbot/${result.id}`}>
                      Open PDF in Chatbot
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            <p className="font-semibold font-roboto tracking-wide text-gray-600">
              {result.description}
            </p>
            <p className="font-roboto tracking-wide text-gray-800">
              {result.description2}
            </p>
          </div>
        ))}
      </div>

      {pdfVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white w-3/4 h-3/4 rounded-lg overflow-hidden">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={closePdf}
            >
              <i className="bx bx-window-close bx-sm" ></i>
            </button>
            <iframe src={pdfPath} className="w-full h-full"></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayedResult;
