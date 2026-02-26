import { Button } from "@nextui-org/react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Split from "react-split";
import EnhancedLoader from "../../components/ui/EnhancedLoader";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { WordFadeIn } from "../../components/ui/WordFadeIn";
import { apiConfig } from "../../config/api";

const SeprateResults = () => {
  const location = useLocation();
  const { uuid } = useParams();

  // Handle both entity and semantic search data structures
  const stateData = location.state || {};
  const {
    searchType,
    // Entity search fields
    metadata: entityMetadata,
    summary: entitySummary,
    petitioner: entityPetitioner,
    respondent: entityRespondent,
    entities: entityEntities,
    // Semantic search fields
    SemanticResultData,
    EntityResultData,
  } = stateData;

  // Determine which data structure we're working with
  const isEntitySearch = EntityResultData || searchType === "entity";
  const isSemanticSearch = SemanticResultData || searchType === "semantic";

  // Get the current case data based on UUID
  let currentCase = null;
  if (isSemanticSearch && SemanticResultData) {
    currentCase = SemanticResultData.find((item) => item.uuid === uuid);
  } else if (isEntitySearch && EntityResultData) {
    currentCase = EntityResultData.find((item) => item.uuid === uuid);
  } else if (entityMetadata || entitySummary) {
    // Fallback to legacy state structure
    currentCase = {
      uuid,
      summary: entitySummary,
      petitioner: entityPetitioner,
      respondent: entityRespondent,
      entities: entityEntities,
      metadata: entityMetadata,
    };
  } // Extract data from current case
  const summary = currentCase?.summary || entitySummary || "No summary available.";
  const metadata = currentCase?.metadata || entityMetadata || {};
  const petitioner = currentCase?.petitioner || metadata?.PETITIONER || entityPetitioner || "Unknown";
  const respondent = currentCase?.respondent || metadata?.RESPONDENT || entityRespondent || "Unknown";
  const entities = currentCase?.entities || entityEntities || "N/A";
  // Debug logging
  console.log("SeprateResults Debug:", {
    uuid,
    searchType,
    isEntitySearch,
    isSemanticSearch,
    currentCase,
    hasSemanticData: !!SemanticResultData,
    hasEntityData: !!EntityResultData,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [isStreaming, setIsStreaming] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFields, setExpandedFields] = useState({});
  // Helper function to toggle field expansion
  const toggleFieldExpansion = (fieldName) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Helper function to expand/collapse all fields
  const toggleAllFields = (expand = true) => {
    const allFields = [
      "summary_preview",
      "date",
      "judge",
      "court",
      "case_number",
      "lawyer",
      "org",
      "other_person",
      "precedent",
      "provision",
      "statute",
      "petitioner",
      "respondent",
      "entities",
    ];

    // Add metadata fields dynamically
    if (metadata) {
      Object.keys(metadata).forEach((key) => {
        allFields.push(`metadata_${key}`);
      });
    }

    const newExpandedState = {};
    allFields.forEach((field) => {
      newExpandedState[field] = expand;
    });
    setExpandedFields(newExpandedState);
  };
  // Check if any fields are expanded
  const hasExpandedFields = Object.values(expandedFields).some(Boolean);
  const expandedCount = Object.values(expandedFields).filter(Boolean).length;

  // Handle keyboard shortcuts for accessibility
  const handleKeyDown = (event, fieldName) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFieldExpansion(fieldName);
    }
  }; // Helper function to render text with show more/less functionality
  const renderExpandableText = (text, fieldName, maxLength = 200) => {
    if (!text || text.length <= maxLength) {
      return <span className="break-words leading-relaxed">{text}</span>;
    }

    const isExpanded = expandedFields[fieldName];
    const truncatedLength = maxLength;
    const wordCount = text.split(" ").length;
    const estimatedWords = Math.ceil(truncatedLength / 5); // Rough estimate of words

    if (isExpanded) {
      return (
        <span className="break-words leading-relaxed">
          {text}{" "}
          <button
            onClick={() => toggleFieldExpansion(fieldName)}
            onKeyDown={(e) => handleKeyDown(e, fieldName)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium underline ml-1 inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm"
            aria-label={`Collapse ${fieldName.replace("_", " ")} text`}
            aria-expanded="true"
            tabIndex={0}
          >
            Show less
          </button>
        </span>
      );
    }

    return (
      <span className="break-words leading-relaxed">
        {text.substring(0, maxLength)}
        <span className="text-gray-400 mx-1">...</span>
        <button
          onClick={() => toggleFieldExpansion(fieldName)}
          onKeyDown={(e) => handleKeyDown(e, fieldName)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium underline ml-1 inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm"
          aria-label={`Expand ${fieldName.replace("_", " ")} text (${
            wordCount > estimatedWords ? `~${wordCount - estimatedWords} more words` : "more"
          })`}
          aria-expanded="false"
          tabIndex={0}
        >
          Show more
        </button>
      </span>
    );
  };

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
          method: "GET",
          url: `${apiConfig.baseURL}/get-file/${uuid}`,
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
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
          contentType: response.headers["content-type"],
          dataSize: response.data?.size,
        });

        if (!response.data?.size) {
          throw new Error("Empty PDF received");
        }

        if (!response.headers["content-type"]?.includes("application/pdf")) {
          throw new Error(`Invalid content type: ${response.headers["content-type"]}`);
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

        let errorMessage = "Failed to fetch PDF";
        if (error.response) {
          // Server responded with error
          errorMessage = `Server error: ${error.response.status} - ${
            error.response?.data?.detail || error.response?.statusText
          }`;
        } else if (error.request) {
          // Request made but no response
          errorMessage = "No response from server";
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
  }, [uuid, pdfFile]);
  // Add loading indicator at component level
  if (!uuid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No document ID provided</p>
      </div>
    );
  }

  if (!currentCase && !entitySummary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Case not found</p>
          <p className="text-gray-500">The case with UUID {uuid} could not be found in the provided data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-Inter bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-lg sm:text-xl font-bold mb-6 break-words leading-tight">
          {currentCase ? `${petitioner} v. ${respondent}` : "Case Details Not Available"}
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
            {" "}
            <Card className="mb-6">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                {!isStreaming && (
                  <Button color="primary" size="sm" onClick={() => setIsStreaming(true)} className="w-full sm:w-auto">
                    Generate Summary
                  </Button>
                )}
              </CardHeader>{" "}
              <CardBody>
                {isStreaming ? (
                  <div className="prose max-w-none dark:prose-invert">
                    <WordFadeIn words={summary} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400">Click Generate Summary to view</p>
                    {summary && summary !== "No summary available." && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Preview:</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {renderExpandableText(summary, "summary_preview", 300)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>{" "}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-semibold">Case Details</h2>
                  {expandedCount > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {expandedCount} expanded
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleAllFields(true)} className="text-xs">
                    Expand All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleAllFields(false)}
                    className="text-xs"
                    disabled={!hasExpandedFields}
                  >
                    Collapse All
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {" "}
                {isSemanticSearch && metadata ? (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {metadata.DATE && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Date of Judgment:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.DATE, "date", 100)}</dd>
                      </>
                    )}
                    {metadata.JUDGE && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Judges:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.JUDGE, "judge", 150)}</dd>
                      </>
                    )}
                    {metadata.COURT && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Court:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.COURT, "court", 100)}</dd>
                      </>
                    )}
                    {metadata.CASE_NUMBER && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Case Number:</dt>
                        <dd className="mb-4 md:mb-0">
                          {renderExpandableText(metadata.CASE_NUMBER, "case_number", 120)}
                        </dd>
                      </>
                    )}
                    {metadata.LAWYER && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Lawyers:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.LAWYER, "lawyer", 200)}</dd>
                      </>
                    )}
                    {metadata.ORG && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Organizations:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.ORG, "org", 200)}</dd>
                      </>
                    )}
                    {metadata.OTHER_PERSON && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Other Persons:</dt>
                        <dd className="mb-4 md:mb-0">
                          {renderExpandableText(metadata.OTHER_PERSON, "other_person", 200)}
                        </dd>
                      </>
                    )}
                    {metadata.PRECEDENT && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Precedents:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.PRECEDENT, "precedent", 300)}</dd>
                      </>
                    )}
                    {metadata.PROVISION && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Provisions:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.PROVISION, "provision", 250)}</dd>
                      </>
                    )}
                    {metadata.STATUTE && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Statutes:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(metadata.STATUTE, "statute", 200)}</dd>
                      </>
                    )}
                  </dl>
                ) : (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <dt className="font-semibold text-gray-700 dark:text-gray-300">Petitioner:</dt>
                    <dd className="mb-4 md:mb-0">{renderExpandableText(petitioner, "petitioner", 150)}</dd>

                    <dt className="font-semibold text-gray-700 dark:text-gray-300">Respondent:</dt>
                    <dd className="mb-4 md:mb-0">{renderExpandableText(respondent, "respondent", 150)}</dd>

                    {entities && (
                      <>
                        <dt className="font-semibold text-gray-700 dark:text-gray-300">Entities:</dt>
                        <dd className="mb-4 md:mb-0">{renderExpandableText(entities, "entities", 200)}</dd>
                      </>
                    )}

                    {metadata &&
                      Object.entries(metadata).map(
                        ([key, value]) =>
                          value && (
                            <React.Fragment key={key}>
                              <dt className="font-semibold text-gray-700 dark:text-gray-300">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                              </dt>
                              <dd className="mb-4 md:mb-0">
                                {renderExpandableText(String(value), `metadata_${key}`, 200)}
                              </dd>
                            </React.Fragment>
                          )
                      )}
                  </dl>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="overflow-hidden pl-2">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: "100%" }}>
                {" "}
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <EnhancedLoader size="md" label="Loading PDF document..." center={true} />
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
