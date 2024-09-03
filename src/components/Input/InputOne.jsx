import React from "react";
import {useState, useRef} from "react";

const InputOne = () => {
  const inputRef = useRef();
  const [query, setQuery] = useState("");


  const onSubmit = (e) => {
    e.preventDefault();
    setQuery(inputRef.current.value);
    console.log("Query: ", query);
    
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(e);
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg flex justify-center w-full">
      <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex just">
        <input
          type="text"
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder="Enter your search query...."
          className="w-full border-none outline-none"
        />
        <div className=" relative">
          <button onClick={onSubmit} >
            <i className="bx bx-send bx-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputOne;
