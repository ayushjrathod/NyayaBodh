import axios from "axios";
import React, { useEffect, useState } from "react";

const Recommend = ({ uuid }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`/recommend/${uuid}`);
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [uuid]);

  return (
    <div className="h-screen flex items-center justify-center">
      <h1>Recommendations</h1>
      <ul>
        {/* {recommendations.map((recommendation, index) => (
          <li key={index}>
            <h2>{recommendation.case_name}</h2>
            <p>{recommendation.summary}</p>
          </li>
        ))} */}
      </ul>
    </div>
  );
};

export default Recommend;
