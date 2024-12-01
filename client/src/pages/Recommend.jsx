import React, { useState } from "react";
import data from "../../public/results.json";

const Recommend = () => {
  const [showMore, setShowMore] = useState({});

  const toggleShowMore = (id) => {
    setShowMore((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      <h1>Recommend</h1>
      <div className="flex flex-wrap justify-center">
        {data.map((item) => (
          <div
            className=" w-72 m-2 p-4 bg-gray-200 border-2 rounded-xl"
            key={item.id}
          >
            <h2>{item.title}</h2>
            <p>
              {showMore[item.id]
                ? item.description
                : `${item.description.substring(0, 100)}...`}
              <button className=" text-blue-700" onClick={() => toggleShowMore(item.id)}>
                {showMore[item.id] ? "Show Less" : "Show More"}
              </button>
            </p>
            <p>{item.link}</p>
            <p>{item.image}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommend;
