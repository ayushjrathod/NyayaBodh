import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useLocation } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Summary = () => {
  const location = useLocation();
  const { id, title, pdf } = location.state;
  const [numPages, setNumPages] = React.useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log(`Loaded a document with ${numPages} pages.`);
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error while loading document:", error);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <h1>Summrize</h1>
      <div className="flex justify-center h-screen overflow-y-scroll rounded-lg p-4">
        <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} scale={2.1} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default Summary;
