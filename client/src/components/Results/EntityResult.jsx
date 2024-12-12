import { Card, CardBody, Divider,CardFooter,Button, } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare } from "lucide-react";


const EntityResult = ({ resultsData }) => {
  const navigate = useNavigate();

  const handleTitleClick = (result) => {
    navigate(`/result/${result.uuid}`, {
      state: {
        searchType: "entity",
        metadata: result.metadata || {},  // Add metadata
        id: result.uuid,  // Add id
        title: `${result.petitioner} v. ${result.respondent}`,
        petitioner: result.petitioner,
        respondent: result.respondent,
        entities: result.entities,
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
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">
        Entity Search Results
      </h1>
      <div className="space-y-4">
        {resultsData?.EntityResultData?.map((result) => {
          // Extract petitioner and respondent names before the first comma
          const petitionerName = result.petitioner.split(",")[0].trim();
          const respondentName = result.respondent.split(",")[0].trim();

          // Debug: Log the summary content
          // console.log("Summary content:", result.summary);

          // Extract background section
          const summaryContent = result.summary || "";
          const backgroundSection = summaryContent.match(/Background:\s*(.*?)\s*Tasks:/is)?.[1]?.trim();

          // Truncate background section if it exists
          const truncatedBackground = backgroundSection
            ? truncateText(backgroundSection, 250)
            : null;

          return (
            <Card key={result.uuid} className="w-full">
              <CardBody>
                <button
                  onClick={() => handleTitleClick(result)}
                  className="text-lg text-start font-semibold hover:underline hover:decoration-1 cursor-pointer hover:text-blue-600"
                >
                  {`${petitionerName} v. ${respondentName}`}
                </button>
                <p className="text-xl font-semibold text-default-500">
                  Entities: {result.entities}
                </p>
                {truncatedBackground ? (
                  <p className="text-md  mt-2 text-default-600">
                    {truncatedBackground}
                  </p>
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
                  Recommend Citations
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

export default EntityResult;
