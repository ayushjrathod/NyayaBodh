import React from "react";
import ChatBubble from "./ChatBubble";

const ChatMessages = React.memo(({ messages }) => (
  <div className="grid grid-cols-12 gap-y-2 px-2">
    {messages.map((message, index) => (
      <ChatBubble key={index} role={message.role} content={message.content} />
    ))}
  </div>
));
ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
