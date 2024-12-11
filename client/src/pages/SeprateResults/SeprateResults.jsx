import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Split from "react-split";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { WordFadeIn } from "../../components/ui/WordFadeIn";

const SeprateResults = () => {
  const location = useLocation();
  const { searchType } = location.state;

  let id, title, date, judges, entities, summary;
  if (searchType === "semantic") {
    ({ id, title, date, judges, summary } = location.state || {});
  } else {
    ({ id, title, entities, summary } = location.state || {});
  }

  const [pdfFile, setPdfFile] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`YOUR_API_ENDPOINT/getfile?id=${id}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfFile(url);
        } else {
          console.error("Failed to fetch PDF file");
        }
      } catch (error) {
        console.error("Error fetching PDF file:", error);
      }
    };
    if (id) {
      fetchPdf();
    }
  }, [id]);

  return (
    <div className="min-h-screen font-Inter bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        <Split
          sizes={[50, 50]}
          minSize={100}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="ew-resize"
          className="flex h-[calc(100vh-150px)]"
          gutter={(index, direction) => {
            const gutter = document.createElement("div");
            gutter.className = `gutter gutter-${direction} bg-gray-300 rounded-full max-w-[5px] dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-ew-resize`;
            return gutter;
          }}
        >
          <div className="overflow-auto pr-2">
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold">Summary</h2>
              </CardHeader>
              <CardBody>
                {summary ? (
                  <WordFadeIn words={summary} />
                ) : (
                  <p className="text-gray-500 font-normal">No summary available.</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Case Details</h2>
              </CardHeader>
              <CardBody>
                <dl className="grid grid-cols-2 gap-4">
                  <dt className="font-semibold">Case Number:</dt>
                  <dd>{id}</dd>
                  <dt className="font-semibold">Date of Judgment:</dt>
                  <dd>{date}</dd>
                  {searchType === "semantic" ? (
                    <>
                      <dt className="font-semibold">Judges:</dt>
                      <dd>{judges}</dd>
                    </>
                  ) : (
                    <>
                      <dt className="font-semibold">Entities:</dt>
                      <dd>{entities}</dd>
                    </>
                  )}
                  <dt className="font-semibold">Parties:</dt>
                  <dd>{title}</dd>
                  <dt className="font-semibold">Acts Referred:</dt>
                  <dd>Yet to be extracted</dd>
                </dl>
              </CardBody>
            </Card>
          </div>

          <div className="overflow-hidden pl-2">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: "100%" }}>
                {pdfFile ? (
                  <Viewer theme="dark" fileUrl={pdfFile} plugins={[defaultLayoutPluginInstance]} />
                ) : (
                  <p>Loading PDF...</p>
                )}
              </div>
            </Worker>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default SeprateResults;
