import { Button, Card, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

// Parse metadata helper function
function parseMetadata(metadata) {
  if (!metadata) return { title: "", date: "", judges: "" };

  const lines = metadata.split("\n");

  // Extract title - get lines between name and appeal number
  const titleStart = lines.findIndex((line) => !line.includes("[") && !line.includes(":"));
  const titleEnd = lines.findIndex((line) => line.includes("(Criminal Appeal") || line.includes("(Civil Appeal"));
  const titleLines = lines.slice(titleStart, titleEnd);
  const title = titleLines.join(" ").trim();

  // Extract date
  const dateLine = lines.find((line) =>
    /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/.test(
      line
    )
  );
  const date = dateLine ? dateLine.trim() : "";

  // Extract judges
  const judgeLine = lines.find((line) => line.includes("JJ."));
  const judges = judgeLine
    ? judgeLine
        .replace("[", "")
        .replace("JJ.]", "")
        .replace(/\*/g, "")
        .split("and")
        .map((j) => j.trim())
        .join(", ")
    : "";

  return { title, date, judges };
}

const SemanticResults = ({ resultsData }) => {
  const navigate = useNavigate();

  const handleTitleClick = (id, title, date, judges) => {
    navigate(`/result/${id}`, {
      state: {
        id,
        title,
        date,
        judges,
      },
    });
  };

  return (
    <main className="p-4">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Semantic Search Results</h1>
      <div className="space-y-4">
        {resultsData?.SemanticResultData?.map((result) => {
          const parsed = parseMetadata(result.metadata);
          return (
            <Card key={result.id} className="w-full">
              <CardBody>
                <button
                  onClick={() => handleTitleClick(result.id, parsed.title, parsed.date, parsed.judges)}
                  className="text-lg font-semibold hover:underline hover:decoration-2 cursor-pointer hover:text-blue-600"
                >
                  {parsed.title}
                </button>
                <p className="text-small text-default-500">{result.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-small">Date: {parsed.date}</span>
                  <span className="text-small">Judge: {parsed.judges}</span>
                </div>
              </CardBody>
              <Divider />
              <CardFooter className="justify-between">
                <Button color="primary" variant="light" startContent={<FileText size={18} />}>
                  Open PDF
                </Button>
                <Button color="secondary" variant="light" startContent={<MessageSquare size={18} />}>
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
