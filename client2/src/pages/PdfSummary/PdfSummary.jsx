import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Split from "react-split";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Sparkles } from "lucide-react";
import { WordFadeIn } from "../../components/ui/WordFadeIn";

const PdfSummary = () => {
  const location = useLocation();
  const selectedFile = location.state?.selectedFile;
  const { id, title, date, judges } = location.state || { id: "", title: "", date: "", judges: "" };
  const [summary, setSummary] = useState("");
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);

      // Clean up the URL object when the component unmounts or selectedFile changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [selectedFile]);

  const generateSummary = () => {
    setSummary(
      "This is a dummy summary of the case. It provides a brief overview of the key points and decisions made in the judgment."
    );
  };

  const handleGenrateSummary = async () => {
    try {
      setSummary(""); // Reset existing summary
      const response = await fetch("YOUR_BACKEND_URL/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          caseId: id,
        }),
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and append to accumulated text
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setSummary(accumulatedText);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Error generating summary. Please try again.");
    }
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
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
              <div style={{ height: "100%" }}>
                {fileUrl && <Viewer theme="dark" fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />}
              </div>
            </Worker>
          </div>
        </Split>
      </div>
    </div>
  );
};

export default PdfSummary;
