import { Button, Card, Textarea } from "@nextui-org/react";
import { ArrowDown, Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { WordFadeIn } from "../../components/ui/WordFadeIn";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { id } = useParams();

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
      setIsAtBottom(Math.abs(scrollHeight - (scrollTop + clientHeight)) < 1);
    }
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = { id: Date.now(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputText, uuid: id }),
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const tempMessageId = Date.now();
      setMessages((prev) => [...prev, { id: tempMessageId, text: "", sender: "ai" }]);
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) => prev.map((msg) => (msg.id === tempMessageId ? { ...msg, text: accumulatedText } : msg)));
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);

      setMessages((prev) => [...prev, { id: Date.now(), text: "Oops! Something went wrong.", sender: "ai" }]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden font-Poppins">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div
        className={`absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full ${
          isDarkMode
            ? "bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"
            : "bg-[radial-gradient(circle_400px_at_50%_300px,#d5c5ff,#ffffff80)]"
        } `}
      ></div>

      <div className="z-10 flex items-center justify-center flex-col h-full mt-5">
        <Card
          className={`w-full max-w-4xl h-[80vh] flex flex-col backdrop-blur-[3px] bg-slate-300/5 border ${
            isDarkMode ? "border-gray-800" : "border-gray-300"
          }`}
        >
          <div className="flex-grow overflow-y-auto p-4 scrollbar-hide" ref={chatContainerRef} onScroll={handleScroll}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {message.sender === "user" ? (
                    <User className="w-6 h-6 ml-2 text-primary" />
                  ) : (
                    <Bot className="w-6 h-6 mr-2 text-secondary" />
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.sender === "user"
                        ? "bg-primary  text-primary-foreground"
                        : "bg-default-100 text-default-foreground"
                    }`}
                  >
                    {message.sender === "ai" ? (
                      <WordFadeIn words={message.text} className="text-sm text-foreground" />
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isAtBottom && (
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
          <div className={`p-4 border-t ${isDarkMode ? "border-gray-800" : "border-gray-300"}`}>
            <div className="flex items-center space-x-2">
              <Textarea
                autoFocus
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-grow bg-transparent resize-none overflow-hidden p-2 outline-none"
                minRows={1}
                maxRows={4}
                ref={textareaRef}
                classNames={{
                  label: "text-foreground",
                  inputWrapper: "bg-transparent",
                  input: "bg-transparent text-foreground",
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
};

export default Chatbot;
