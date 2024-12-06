import { Button, Card, CardBody, CardHeader, Divider, Input, Textarea } from "@nextui-org/react";
import axios from "axios";
import { AlertCircle, FileText, Upload } from "lucide-react";
import React, { useState } from "react";

const GenAIClause = () => {
  const [file, setFile] = useState(null);
  const [userClause, setUserClause] = useState("");
  const [responsePdfUrl, setResponsePdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (FormEvent) => {
    const selectedFile = FormEvent.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleClauseChange = (event) => {
    setUserClause(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResponsePdfUrl(null);

    if (!file || !userClause) {
      setError("Please provide both a PDF file and a clause.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_clause", userClause);

    try {
      const response = await axios.post("https://whale-legal-api.onrender.com/genai/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setResponsePdfUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError("An error occurred while processing the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl h-screen mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex gap-3">
          <FileText size={24} />
          <div className="flex flex-col">
            <p className="text-md">AI-Powered PDF Modification</p>
            <p className="text-small text-default-500">Upload a PDF and enter a clause to modify it</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={loading}
              startContent={<Upload size={18} />}
              label="Upload PDF"
            />
            <Textarea
              value={userClause}
              onChange={handleClauseChange}
              placeholder="Enter modification clause"
              disabled={loading}
              label="Enter Clause"
              minRows={3}
            />
            {error && (
              <div className="flex items-center text-danger">
                <AlertCircle size={18} className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              color="primary"
              className="w-full"
              startContent={loading ? null : <FileText size={18} />}
            >
              {loading ? "Processing..." : "Modify PDF"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {responsePdfUrl && (
        <Card>
          <CardBody>
            <iframe src={responsePdfUrl} title="Modified PDF" width="100%" height="600px" className="rounded-md" />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default GenAIClause;
