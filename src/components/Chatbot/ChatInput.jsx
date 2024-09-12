const ChatInput = ({ input, setInput, handleSendMessage, handleKeyPress, inputRef }) => (
  <div className="bg-gray-200 rounded-lg flex justify-center w-full">
    <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex just">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyUp={handleKeyPress}
        className="w-full border-none outline-none"
        placeholder="Type a message..."
      />
      <div className=" relative">
        <button onClick={handleSendMessage}>
          <i className="bx bx-send bx-sm"></i>
        </button>
      </div>
    </div>
  </div>
);

export default ChatInput;
