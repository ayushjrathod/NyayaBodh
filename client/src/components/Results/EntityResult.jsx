import { Card, CardBody, Divider } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const EntityResult = ({ resultsData }) => {
  const navigate = useNavigate();

  const handleTitleClick = (id, title, entities) => {
    navigate(`/result/${id}`, {
      state: {
        SearchType: "entity",
        id,
        title,
        entities,
      },
    });
  };
  const handleChatWithPdfClick = (pdfchatid) => {
    navigate(`/chat/${pdfchatid}`);
  };
  const handleRecommendCitationsClick = (id) => {
    navigate(`/recommend/${id}`);
  };

  return (
    <main className="p-4">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Entity Search Results</h1>
      <div className="space-y-4">
        {resultsData?.EntityResultData?.map((result) => {
          return (
            <Card key={result.uuid} className="w-full">
              <CardBody>
                <button
                  onClick={() => handleTitleClick(result.uuid, result.case_name, result.entities)}
                  className="text-lg font-semibold hover:underline hover:decoration-1 cursor-pointer hover:text-blue-600"
                >
                  {result.case_name}
                </button>
                <p className="text-xl font-semibold text-default-500">Entites: {result.entities}</p>
              </CardBody>
              <Divider />
              {/* <CardFooter className="justify-between">
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
              </CardFooter> */}
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default EntityResult;
