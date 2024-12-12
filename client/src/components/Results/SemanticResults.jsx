import { Button, Card, CardBody, CardFooter, Divider, semanticColors } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";

import { useNavigate } from "react-router-dom";

const SemanticResults = ({ resultsData }) => {
  const navigate = useNavigate();

  const handleTitleClick = (result) => {
    navigate(`/result/${result.uuid}`, {
      state: {
        searchType: "semantic",
        metadata: result.metadata,
        summary: result.summary,
      },
    });
  };

  // Extract case title from result
  const getCaseTitle = (result) => {
    return result.file_name?.replace(".pdf", "") || "Unknown Title";
  };

  // Extract first paragraph from summary background
  const getBackgroundSummary = (summary) => {
    if (!summary) return "No background available";
    const backgroundMatch = summary.match(/Background:\s*(.*?)(?=\n\n)/s);
    return backgroundMatch ? backgroundMatch[1].trim() : "No background available";
  };

  // Extract court name and case number
  const getCourtInfo = (result) => {
    const court = result.COURT?.split(",")[0] || "N/A";
    const caseNumber = result.CASE_NUMBER?.split(",")[0] || "N/A";
    return { court, caseNumber };
  };

  const handleChatWithPdfClick = (uuid) => {
    navigate(`/chat/${uuid}`);
  };
  const handleRecommendCitationsClick = (uuid) => {
    navigate(`/recommend/${uuid}`);
  };
  console.log(resultsData)
  return (
    <>
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">
        Total {resultsData?.length} results found for your semantic search.
      </h1>
      <div className="space-y-4">
        {resultsData.map((result) => (
          <Card key={result.uuid} className="w-full">
            <CardBody>
              <button
                onClick={() => handleTitleClick(result)}
                className="flex text-start justify-start text-lg font-semibold hover:underline hover:decoration-2 cursor-pointer hover:text-blue-600"
              >
                {result.metadata.PETITIONER || 'Unknown'} v. {result.metadata.RESPONDENT || 'Unknown'}
              </button>
              <p className="text-small text-default-500">
                {getBackgroundSummary(result.summary)}
              </p>
              <p className="text-small">
                {result.summary.split(' ').slice(0, 250).join(' ')}...
              </p>
              <div className="flex justify-between items-center mt-2">
                {(() => {
                  const { court, caseNumber } = getCourtInfo(result);
                  return (
                    <>
                      <span className="text-small">Court: {result.metadata.COURT}</span>
                      <span className="text-small">Judges: {result.metadata.JUDGE}</span>
                    </>
                  );
                })()}
              </div>
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
        ))}
      </div>
    </>
  );
};

export default SemanticResults;
