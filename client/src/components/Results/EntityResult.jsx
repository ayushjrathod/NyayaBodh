import React from "react";

const EntityResult = ({ resultsData }) => {
  console.log(resultsData.EntityResultData);
  return (
    <div className="">
      <h1 className="mx-2 my-1 mt-2 font-poppins tracking-wide font-semibold">Entity Search Results</h1>
      {resultsData.EntityResultData.map((item) => (
        <div key={item.uuid} className="p-2 border-b-2">
          <h3 className="font-semibold pb-1">{item.case_name}</h3>
          <p>
            <strong>Entities:</strong> {item.entities}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EntityResult;
