import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader, Chip, Divider, Skeleton } from "@nextui-org/react";
import { useParams } from "react-router-dom";

const Recommend = () => {
  // Initialize as empty array
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {uuid} = useParams();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/recommend/${uuid}`);
        // Check if the response contains the expected structure
        if (response.data && response.data.recommended_cases) {
          setRecommendations(response.data.recommended_cases);
          console.log(recommendations)
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRecommendations();
  }, []);  // Ensure uuid is in the dependency array
  

  // Render section with safe array check
  return (
    <div className="space-y-4 p-4 grid grid-cols-3">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <Skeleton className="h-4 w-3/4" />
            </CardBody>
          </Card>
        ))
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : Array.isArray(recommendations) && recommendations.length > 0 ? (
        recommendations.map((rec, index) => (
          <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-start px-4 pt-4 pb-0">
            <h3 className="text-lg font-bold">{rec.CASE_NUMBER}</h3>
            <p className="text-small text-default-500">{rec.COURT} - {rec.DATE}</p>
          </CardHeader>
          <Divider className="my-2" />
          <CardBody className="px-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              <InfoItem label="Judge" value={rec.JUDGE} />
              <InfoItem label="GPE" value={rec.GPE} />
              <InfoItem label="Petitioner" value={rec.PETITIONER} />
              <InfoItem label="Respondent" value={rec.RESPONDENT} />
              <InfoItem label="Lawyer" value={rec.LAWYER} />
              <InfoItem label="Organization" value={rec.ORG} />
              <InfoItem label="Other Person" value={rec.OTHER_PERSON} />
              <InfoItem label="Witness" value={rec.WITNESS} />
            </div>
            <Divider className="my-2" />
            <div className="mt-2">
              <InfoItem label="Statute" value={rec.STATUTE} />
              <InfoItem label="Provision" value={rec.PROVISION} />
              <InfoItem label="Precedent" value={rec.PRECEDENT} />
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-small">File: {rec.file_name}</p>
              <Chip color="primary" variant="flat">Similarity: {rec.similarity.toFixed(2)}</Chip>
            </div>
          </CardBody>
        </Card>
        ))
      ) : (
        <div>No recommendations found</div>
      )}
    </div>
  );
}

const InfoItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-small font-semibold">{label}:</p>
      <p className="text-small text-default-500">{value}</p>
    </div>
  );
};

export default Recommend;
