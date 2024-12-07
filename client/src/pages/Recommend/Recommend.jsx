import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, Skeleton } from "@nextui-org/react";

const Recommend = ({ uuid }) => {
  // Initialize as empty array
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/recommend/${uuid}`);
        // Ensure response.data is array or use empty array
        setRecommendations(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
        // Reset to empty array on error
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [uuid]);

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
              <h3>{rec.case_name}</h3>
              <p>{rec.summary}</p>
            </CardBody>
          </Card>
        ))
      ) : (
        <div>No recommendations found</div>
      )}
    </div>
  );
};

export default Recommend;
