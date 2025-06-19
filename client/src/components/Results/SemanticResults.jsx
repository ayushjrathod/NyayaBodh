import { Button, Card, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SemanticResults = ({ resultsData, searchType }) => {
  const navigate = useNavigate();
  const [expandedEntities, setExpandedEntities] = useState({});

  const toggleEntities = (uuid) => {
    setExpandedEntities((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  const renderEntities = (entitiesArray, uuid) => {
    const entityText = entitiesArray.filter(Boolean).join(", ") || "Not specified";
    const isExpanded = expandedEntities[uuid];
    const maxLength = 100; // Character limit for entities

    if (entityText.length <= maxLength) {
      return entityText;
    }

    if (isExpanded) {
      return (
        <>
          {entityText}{" "}
          <button
            onClick={() => toggleEntities(uuid)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Show less
          </button>
        </>
      );
    }

    return (
      <>
        {entityText.substring(0, maxLength)}...{" "}
        <button onClick={() => toggleEntities(uuid)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Show more
        </button>
      </>
    );
  };
  const handleTitleClick = (result) => {
    navigate(`/result/${result.uuid}`, {
      state: {
        searchType: "semantic",
        SemanticResultData: resultsData || [],
        // Legacy support for backward compatibility
        metadata: result.metadata,
        summary: result.summary,
      },
    });
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const handleChatWithPdfClick = (uuid) => {
    navigate(`/chat/${uuid}`);
  };
  const handleRecommendCitationsClick = (uuid) => {
    navigate(`/recommend/${uuid}`);
  };
  return (
    <main className="p-4">
      {" "}
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">
        Total {resultsData?.length || 0} results found for your semantic search.
      </h1>
      <div className="space-y-4">
        {(resultsData || []).map((result) => {
          // Extract background section
          const summaryContent = result.summary || "";
          const backgroundSection = summaryContent.match(/Background:\s*(.*?)\s*Tasks:/is)?.[1]?.trim();

          // Truncate background section if it exists
          const truncatedBackground = backgroundSection ? truncateText(backgroundSection, 250) : null;

          return (
            <Card key={result.uuid} className="w-full">
              <CardBody>
                <button
                  onClick={() => handleTitleClick(result)}
                  className="text-lg text-start font-semibold hover:underline hover:decoration-1 cursor-pointer hover:text-blue-600"
                >
                  {(typeof result.metadata?.PETITIONER === "string"
                    ? result.metadata.PETITIONER.split(",")[0]?.trim()
                    : result.metadata?.PETITIONER) || "Unknown"}{" "}
                  v.{" "}
                  {(typeof result.metadata?.RESPONDENT === "string"
                    ? result.metadata.RESPONDENT.split(",")[0]?.trim()
                    : result.metadata?.RESPONDENT) || "Unknown"}{" "}
                </button>
                <p className="text-xl font-semibold text-default-500">
                  Entities: {renderEntities([result.metadata?.COURT, result.metadata?.JUDGE], result.uuid)}
                </p>
                {truncatedBackground ? (
                  <p className="text-md mt-2 text-default-600">{truncatedBackground}</p>
                ) : (
                  <p className="text-md mt-2 line-clamp-3 text-default-600 italic">
                    {summaryContent || "No background information available."}
                  </p>
                )}
              </CardBody>
              <Divider />
              <CardFooter className="justify-between">
                <Button
                  onClick={() => handleRecommendCitationsClick(result.uuid)}
                  color="primary"
                  variant="light"
                  startContent={<FileText size={18} />}
                >
                  Recommend
                </Button>
                <Button
                  onClick={() => handleChatWithPdfClick(result.uuid)}
                  color="secondary"
                  variant="light"
                  startContent={<MessageSquare size={18} />}
                >
                  Chat with PDF
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default SemanticResults;
