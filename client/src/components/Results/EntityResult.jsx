import { Button, Card, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { FileText, MessageSquare } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const EntityResult = ({ resultsData }) => {
  console.log(resultsData.EntityResultData);
  return (
    <main className="p-4">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Semantic Search Results</h1>
      <div className="space-y-4">
        {resultsData?.EntityResultData?.map((result) => {
          return (
            <Card key={result.uuid} className="w-full">
              <CardBody>
                <Link
                  to={"/details"}
                  className="text-lg font-semibold hover:underline hover:decoration-2 cursor-pointer hover:text-blue-600"
                >
                  {result.case_name}
                </Link>
                <p className="text-xl font-semibold text-default-500">Entites: {result.entities}</p>
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

export default EntityResult;
