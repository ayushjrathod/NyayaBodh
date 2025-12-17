import { Button, Card, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";
import PropTypes from "prop-types";
import { memo, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const EntityResult = memo(({ resultsData, searchType }) => {
  const navigate = useNavigate();
  const [expandedEntities, setExpandedEntities] = useState({});

  // Ensure resultsData is an array
  const safeResultsData = useMemo(() => 
    Array.isArray(resultsData) ? resultsData : [], 
    [resultsData]
  );

  // Memoized toggle function to prevent recreation on every render
  const toggleEntities = useCallback((uuid) => {
    setExpandedEntities((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  }, []);

  // Memoized navigation handlers
  const handleTitleClick = useCallback((result) => {
    navigate(`/result/${result.uuid}`, {
      state: {
        searchType: "entity",
        EntityResultData: safeResultsData,
        metadata: result.metadata || {},
        id: result.uuid,
        title: `${result.petitioner} v. ${result.respondent}`,
        petitioner: result.petitioner,
        respondent: result.respondent,
        entities: result.entities,
        summary: result.summary,
      },
    });
  }, [navigate, safeResultsData]);

  const handleChatWithPdfClick = useCallback((uuid) => {
    navigate(`/chat/${uuid}`);
  }, [navigate]);

  const handleRecommendCitationsClick = useCallback((uuid) => {
    navigate(`/recommend/${uuid}`);
  }, [navigate]);

  // Memoized utility functions
  const truncateText = useCallback((text, wordLimit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  }, []);

  const renderEntities = useCallback((entities, uuid) => {
    const entityText = entities || "Not specified";
    const isExpanded = expandedEntities[uuid];
    const maxLength = 100;

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
  }, [expandedEntities, toggleEntities]);

  // Show empty state if no results
  if (safeResultsData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16 text-center">
        <div className="text-lg text-gray-600 mb-2">🔍</div>
        <div className="text-lg font-medium text-gray-700 mb-1">No Entity Results</div>
        <div className="text-sm text-gray-500">Try refining your search query</div>
      </div>
    );
  }

  return (
    <main className="p-4">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">
        Total {safeResultsData.length} results found for your entity search.
      </h1>
      <div className="space-y-4">
        {safeResultsData.map((result) => {
          // Extract petitioner and respondent names before the first comma
          const petitionerName = result.petitioner?.split(",")[0]?.trim() || "Unknown";
          const respondentName = result.respondent?.split(",")[0]?.trim() || "Unknown";

          // Extract background section
          const summaryContent = result.summary || "";
          const backgroundSection = summaryContent.match(/Background:\s*(.*?)\s*Tasks:/is)?.[1]?.trim();

          // Truncate background section if it exists
          const truncatedBackground = backgroundSection ? truncateText(backgroundSection, 250) : null;

          return (
            <EntityResultCard
              key={result.uuid}
              result={result}
              petitionerName={petitionerName}
              respondentName={respondentName}
              truncatedBackground={truncatedBackground}
              summaryContent={summaryContent}
              renderEntities={renderEntities}
              onTitleClick={handleTitleClick}
              onChatClick={handleChatWithPdfClick}
              onRecommendClick={handleRecommendCitationsClick}
            />
          );
        })}
      </div>
    </main>
  );
});

// Separate memoized card component to prevent unnecessary re-renders
const EntityResultCard = memo(({
  result,
  petitionerName,
  respondentName,
  truncatedBackground,
  summaryContent,
  renderEntities,
  onTitleClick,
  onChatClick,
  onRecommendClick
}) => (
  <Card className="w-full">
    <CardBody>
      <button
        onClick={() => onTitleClick(result)}
        className="text-lg text-start font-semibold hover:underline hover:decoration-1 cursor-pointer hover:text-blue-600"
      >
        {`${petitionerName} v. ${respondentName}`}
      </button>
      <p className="text-xl font-semibold text-default-500">
        Entities: {renderEntities(result.entities, result.uuid)}
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
        onClick={() => onRecommendClick(result.uuid)}
        color="primary"
        variant="light"
        startContent={<FileText size={18} />}
      >
        Recommend
      </Button>
      <Button
        onClick={() => onChatClick(result.uuid)}
        color="secondary"
        variant="light"
        startContent={<MessageSquare size={18} />}
      >
        Chat with PDF
      </Button>
    </CardFooter>
  </Card>
));

EntityResultCard.displayName = "EntityResultCard";
EntityResult.displayName = "EntityResult";

EntityResultCard.propTypes = {
  result: PropTypes.object.isRequired,
  petitionerName: PropTypes.string.isRequired,
  respondentName: PropTypes.string.isRequired,
  truncatedBackground: PropTypes.string,
  summaryContent: PropTypes.string.isRequired,
  renderEntities: PropTypes.func.isRequired,
  onTitleClick: PropTypes.func.isRequired,
  onChatClick: PropTypes.func.isRequired,
  onRecommendClick: PropTypes.func.isRequired,
};

EntityResult.propTypes = {
  resultsData: PropTypes.array.isRequired,
  searchType: PropTypes.string.isRequired,
};

export default EntityResult;