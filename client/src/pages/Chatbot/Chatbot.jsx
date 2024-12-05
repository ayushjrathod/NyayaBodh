import { Button, Card, Textarea } from "@nextui-org/react";
import { ArrowDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([{ id: 1, text: "Hello! How can I assist you today?", sender: "ai" }]);
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true); // Tracks if user is at the bottom
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = { text: inputText, isUser: true };
    setMessages([...messages, newMessage]);
    setInputText("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: inputText }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let receivedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedText += decoder.decode(value, { stream: true });
      setMessages((prevMessages) => [...prevMessages.slice(0, -1), { text: receivedText, isUser: false }]);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10); // Allow small margin
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages update
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;

      setInputText(value.substring(0, start) + "\n" + value.substring(end));

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-Poppins">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>

      <div className="relative z-10 flex items-center justify-center flex-col h-full">
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col backdrop-blur-[1px] bg-slate-300/5 border border-gray-800">
          <div className="flex-grow overflow-auto p-4" ref={chatContainerRef} onScroll={handleScroll}>
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          {!isAtBottom && ( // Show button only if not at bottom
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              radius="full"
              className="absolute bottom-24 right-1/2"
              onClick={scrollToBottom}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <Textarea
                autoFocus
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-grow bg-transparent text-white resize-none overflow-hidden p-2 outline-none"
                minRows={1}
                maxRows={4}
                ref={textareaRef}
                classNames={{
                  label: "text-white",
                  inputWrapper: "bg-transparent",
                  input: "bg-transparent",
                }}
              />
              <Button
                isIconOnly
                color="primary"
                variant={inputText.trim() ? "solid" : "light"}
                onClick={handleSendMessage}
                isDisabled={!inputText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Chatbot;
