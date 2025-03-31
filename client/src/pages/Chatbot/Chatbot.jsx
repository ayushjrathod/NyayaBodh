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
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
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
    if (!inputText.trim() || !isDocumentReady) return;

    // Add user message
    const newMessage = { id: Date.now(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    try {
      // Create AI message placeholder
      const tempMessageId = Date.now();
      setMessages((prev) => [...prev, { id: tempMessageId, text: "", sender: "ai" }]);

      const response = await fetch("http://127.0.0.1:8001/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and process the SSE format
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6); // Remove 'data: ' prefix
            if (text) {
              accumulatedText += text;
              // Update the message with accumulated text
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempMessageId
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Error: Could not get a response. Please try again.",
          sender: "ai",
        },
      ]);
    }
  };

  useEffect(() => {
    const prepareDocument = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8001/get-ready/${id}`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.message === "Case ready") {
          setIsDocumentReady(true);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "Document is ready. How can I help you?",
            sender: "ai"
          }]);
        }
      } catch (error) {
        console.error("Error preparing document:", error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Failed to prepare the document. Please try again.",
          sender: "ai"
        }]);
      } finally {
        setIsPreparing(false);
      }
    };

    prepareDocument();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden font-Poppins">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div
        className={`absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full ${isDarkMode
            ? "bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"
            : "bg-[radial-gradient(circle_400px_at_50%_300px,#d5c5ff,#ffffff80)]"
          } `}
      ></div>

      <div className="z-10 flex items-center justify-center flex-col h-full mt-5">
        <Card
          className={`w-full max-w-4xl h-[80vh] flex flex-col backdrop-blur-[3px] bg-slate-300/5 border ${isDarkMode ? "border-gray-800" : "border-gray-300"
            }`}
        >
          <div className="flex-grow overflow-y-auto p-4 scrollbar-hide" ref={chatContainerRef} onScroll={handleScroll}>
            {isPreparing && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <Bot className="w-8 h-8 mb-2 mx-auto animate-bounce text-secondary" />
                  <p>Getting PDF ready...</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === "user" ? "flex flex-row-reverse" : "flex flex-row"}`}
              >
                {message.sender === "user" ? (
                  <div className="px-2">
                    <User className="w-6 h-6 text-primary" />
                    <div className="bg-primary text-primary-foreground p-3 rounded-xl mt-1">
                      <span className="text-sm">{message.text}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Bot className="w-6 h-6 text-secondary" />
                    <div className="bg-default-100 text-default-foreground p-3 rounded-xl">
                      <WordFadeIn words={message.text} className="text-sm text-foreground whitespace-pre-wrap" />
                    </div>
                  </div>
                )}
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
                placeholder={isDocumentReady ? "Type your message..." : "Waiting for document to be ready..."}
                className="flex-grow bg-transparent resize-none overflow-hidden p-2 outline-none"
                minRows={1}
                maxRows={4}
                ref={textareaRef}
                classNames={{
                  label: "text-foreground",
                  inputWrapper: "bg-transparent",
                  input: "bg-transparent text-foreground",
                }}
                disabled={!isDocumentReady}
              />
              <Button
                isIconOnly
                color="primary"
                variant={inputText.trim() ? "solid" : "light"}
                onClick={handleSendMessage}
                isDisabled={!inputText.trim() || !isDocumentReady}
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