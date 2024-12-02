import React from "react";

const EntityResult = ({ EntityResultData }) => {
  console.log(EntityResultData.EntityResultData);
  return (
    <div>
      {EntityResultData.EntityResultData.map((item) => (
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
