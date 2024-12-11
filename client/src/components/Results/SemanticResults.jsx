import { Button, Card, CardBody, CardFooter, Divider, semanticColors } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";

import { useNavigate } from "react-router-dom";


const SemanticResults = ({ resultsData }) => {
  const navigate = useNavigate();
  const handleTitleClick = (id, title, date, judges) => {
    navigate(`/result/${id}`, {
      state: {
        searchType: "semantic",
        id,
        title,
        date,
        judges,
      },
    });
  };

  const handleChatWithPdfClick = (pdfchatid) => {
    navigate(`/chat/${pdfchatid}`);
  };
  const handleRecommendCitationsClick = (id) => {
    navigate(`/recommend/${id}`);
  };
  console.log(resultsData.SemanticResultData)
  return (
    <>
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Semantic Search Results</h1>
      <div className="space-y-4">
        {resultsData?.SemanticResultData?.map((result) => {
          return (
            <Card key={result.uuid} className="w-full">
              <CardBody>
                <button
                  onClick={() => handleTitleClick(result.uuid, result.petitioner, result.summary)}
                  className="flex text-start justify-start text-lg font-semibold hover:underline hover:decoration-2 cursor-pointer hover:text-blue-600"
                >
                  {result.petitioner}
                </button>
                <p className="text-small text-default-500">{result.summary}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-small">Entities: {result.entities}</span>
                  <span className="text-small">Respondent: {result.respondent}</span>
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
    </>
  );
}  
export default SemanticResults;
