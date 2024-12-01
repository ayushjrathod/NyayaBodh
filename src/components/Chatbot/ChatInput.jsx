import React, { useRef } from "react";

const ChatInput = ({ input, setInput, handleSendMessage, handleKeyPress, inputRef, handleFileUpload }) => {
  const fileInputRef = useRef(null);

  const triggerFileUpload = (fileType) => {
    fileInputRef.current.setAttribute("accept", fileType);
    fileInputRef.current.click();
  };

  return (
    <div>
      <div className="bg-gray-200 rounded-xl flex justify-center w-full">
        <div className="bg-white w-full border-2 rounded-xl flex flex-col">
          <div className="flex items-center bg-gray-300 rounded-t-md h-12">
            <button
              onClick={() => triggerFileUpload(".pdf")}
              className="mr-2 ml-4 p-1 w-8 h-8 text-black rounded-md bg-white"
              title="Upload PDF"
            >
              <i className="bx bx-file bx-sm"></i>
            </button>
            <button
              onClick={() => triggerFileUpload("image/*")}
              className="mr-2 p-1 w-8 h-8 text-black rounded-md bg-white"
              title="Image"
            >
              <i className="bx bx-image bx-sm"></i>
            </button>
            <button
              onClick={() => triggerFileUpload(".pptx")}
              className="mr-2 p-1 w-8 h-8 text-black rounded-md bg-white"
              title="Upload PPT"
            >
              <i className="bx bx-slideshow bx-sm"></i>
            </button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
          <div className="p-2 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={handleKeyPress}
              className="w-full border-none outline-none"
              placeholder="Type a message..."
            />
            <div className="relative">
              <button onClick={handleSendMessage}>
                <i className="bx bx-send bx-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
