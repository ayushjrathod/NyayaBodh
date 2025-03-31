import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Split from "react-split";
import { Button } from "@nextui-org/react";
import axios from 'axios';

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { WordFadeIn } from "../../components/ui/WordFadeIn";

const API_BASE_URL = 'http://localhost:8000'; // You might want to move this to an env variable

const SeprateResults = () => {
  const location = useLocation();
  const {uuid} = useParams();
  const { searchType, metadata, summary, petitioner, respondent, entities, id } = location.state || {};

  const [pdfFile, setPdfFile] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [isStreaming, setIsStreaming] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!uuid) {
        console.error("No UUID provided");
        setPdfError("No UUID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPdfError(null);

      try {
        console.log("Fetching PDF for UUID:", uuid);
        const response = await axios({
          method: 'GET',
          url: `${API_BASE_URL}/get-file/${uuid}`,
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf',
          },
          validateStatus: function (status) {
            return status >= 200 && status < 300; // Accept only success status codes
          },
          timeout: 30000,
        });

        // Log response details for debugging
        console.log("Response received:", {
          status: response.status,
          headers: response.headers,
          contentType: response.headers['content-type'],
          dataSize: response.data?.size,
        });

        if (!response.data?.size) {
          throw new Error('Empty PDF received');
        }

        if (!response.headers['content-type']?.includes('application/pdf')) {
          throw new Error(`Invalid content type: ${response.headers['content-type']}`);
        }

        const url = URL.createObjectURL(response.data);
        setPdfFile(url);

      } catch (error) {
        console.error("PDF fetch error:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          config: error.config,
        });

        let errorMessage = 'Failed to fetch PDF';
        if (error.response) {
          // Server responded with error
          errorMessage = `Server error: ${error.response.status} - ${error.response?.data?.detail || error.response?.statusText}`;
        } else if (error.request) {
          // Request made but no response
          errorMessage = 'No response from server';
        } else {
          // Request setup error
          errorMessage = error.message;
        }
        setPdfError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, []);

  // Add loading indicator at component level
  if (!uuid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No document ID provided</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-Inter bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold mb-6">
          {searchType === "semantic" ? 
            `${metadata?.PETITIONER || 'Unknown'} v. ${metadata?.RESPONDENT || 'Unknown'}` : 
            `${petitioner || 'Unknown'} v. ${respondent || 'Unknown'}`}
        </h1>

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
                {!isStreaming && (
                  <Button 
                    color="primary" 
                    size="sm" 
                    onClick={() => setIsStreaming(true)}
                  >
                    Generate Summary
                  </Button>
                )}
              </CardHeader>
              <CardBody>
                {isStreaming ? (
                  <WordFadeIn words={summary || 'No summary available.'} />
                ) : (
                  <p className="text-gray-500">Click Generate Summary to view</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Case Details</h2>
              </CardHeader>
              <CardBody>
                {searchType === "semantic" ? (
                  <dl className="grid grid-cols-2 gap-4">
                    {/* <dt className="font-semibold">Case Number:</dt>
                    <dd>{metadata.CASE_NUMBER}</dd> */}

                    {/* <dt className="font-semibold">Court:</dt>
                    <dd>{metadata.COURT}</dd> */}

                    <dt className="font-semibold">Dates of Judgment:</dt>
                    <dd>{metadata.DATE}</dd>

                    <dt className="font-semibold">Judges:</dt>
                    <dd>{metadata.JUDGE}</dd>

                    <dt className="font-semibold">Lawyers:</dt>
                    <dd>{metadata.LAWYER}</dd>

                    <dt className="font-semibold">Organizations:</dt>
                    <dd>{metadata.ORG}</dd>

                    <dt className="font-semibold">Other Persons:</dt>
                    <dd>{metadata.OTHER_PERSON}</dd>

                    <dt className="font-semibold">Precedents:</dt>
                    <dd>{metadata.PRECEDENT}</dd>

                    <dt className="font-semibold">Provisions:</dt>
                    <dd>{metadata.PROVISION}</dd>

                    <dt className="font-semibold">Statutes:</dt>
                    <dd>{metadata.STATUTE}</dd>
                  </dl>
                ) : (
                  <dl className="grid grid-cols-2 gap-4">
                    <dt className="font-semibold">Petitioner:</dt>
                    <dd>{petitioner || 'Unknown'}</dd>

                    <dt className="font-semibold">Respondent:</dt>
                    <dd>{respondent || 'Unknown'}</dd>

                    <dt className="font-semibold">Entities:</dt>
                    <dd>{entities || 'N/A'}</dd>

                    {metadata && Object.entries(metadata).map(([key, value]) => (
                      value && (
                        <>
                          <dt className="font-semibold">{key}:</dt>
                          <dd>{value}</dd>
                        </>
                      )
                    ))}
                  </dl>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="overflow-hidden pl-2">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: "100%" }}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading PDF...</p>
                  </div>
                ) : pdfError ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-500">Error loading PDF: {pdfError}</p>
                  </div>
                ) : pdfFile ? (
                  <Viewer 
                    theme="dark" 
                    fileUrl={pdfFile} 
                    plugins={[defaultLayoutPluginInstance]}
                    onError={(error) => {
                      console.error("PDF viewer error:", error);
                      setPdfError("Failed to render PDF");
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No PDF available</p>
                  </div>
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
