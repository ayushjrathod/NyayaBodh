import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Split from "react-split";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Sparkles } from "lucide-react";
import { WordFadeIn } from "../components/ui/WordFadeIn";

const SeprateResults = () => {
  const location = useLocation();
  const { id, title, date, judges } = location.state || { id: "", title: "", date: "", judges: "" };
  const [summary, setSummary] = useState("");
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const generateSummary = () => {
    setSummary(
      "This is a dummy summary of the case. It provides a brief overview of the key points and decisions made in the judgment."
    );
  };

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
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Summary</h2>
                <Button
                  color="primary"
                  endContent={<Sparkles strokeWidth={1.5} />}
                  isDisabled={summary.length > 0}
                  onClick={generateSummary}
                >
                  Generate Summary
                </Button>
              </CardHeader>
              <CardBody>
                {summary ? (
                  <WordFadeIn words={summary} />
                ) : (
                  <p className="text-gray-500 font-normal">Click "Generate Summary" to view the case summary.</p>
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
                  <dt className="font-semibold">Judges:</dt>
                  <dd>{judges}</dd>
                  <dt className="font-semibold">Parties:</dt>
                  <dd>{title}</dd>
                  <dt className="font-semibold">Acts Referred:</dt>
                  <dd>Yet to be extracted</dd>
                </dl>
              </CardBody>
            </Card>
          </div>

          <div className="overflow-hidden pl-2">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
              <div style={{ height: "100%" }}>
                <Viewer
                  theme={"dark"}
                  fileUrl="https://pdfobject.com/pdf/sample.pdf"
                  plugins={[defaultLayoutPluginInstance]}
                />
              </div>
            </Worker>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default SeprateResults;
