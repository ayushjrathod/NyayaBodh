import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, Skeleton } from "@nextui-org/react";
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
    <div className="space-y-4 p-4">
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
          <Card key={index}>
            <CardBody>
              <h3>{rec.CASE_NUMBER}</h3>
              <p>{rec.COURT}</p>
              <p>{rec.DATE}</p>
              <p>{rec.GPE}</p>
              <p>{rec.JUDGE}</p>
              <p>{rec.LAWYER}</p>
              <p>{rec.ORG}</p>
              <p>{rec.OTHER_PERSON}</p>
              <p>{rec.PETITIONER}</p>
              <p>{rec.PRECEDENT}</p>
              <p>{rec.PROVISION}</p>
              <p>{rec.RESPONDENT}</p>
              <p>{rec.STATUTE}</p>
              <p>{rec.WITNESS}</p>
              <p>File Name: {rec.file_name}</p>
              <p>Similarity: {rec.similarity}</p>
            </CardBody>
          </Card>
        ))
      ) : (
        <div>No recommendations found</div>
      )}
    </div>
  );
}

export default Recommend;
