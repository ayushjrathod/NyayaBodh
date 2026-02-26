import { Button, Card, Textarea } from "@nextui-org/react";
import { ArrowDown, Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { apiConfig } from "../../config/api";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const { id } = useParams();

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const preparationAttemptedRef = useRef(false);
  const currentDocumentIdRef = useRef(null);

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && isDocumentReady && !isSending) {
        handleSendMessage();
      }
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
    if (!inputText.trim() || !isDocumentReady || isSending) return;

    const userMessage = inputText.trim();
    setIsSending(true);

    // Add user message with unique ID
    const userMessageId = `user_${Date.now()}`;
    const newMessage = { id: userMessageId, text: userMessage, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Create AI message placeholder
    const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Creating AI message with ID: ${aiMessageId}`);

    setStreamingMessageId(aiMessageId); // Track streaming message
    setMessages((prev) => [...prev, { id: aiMessageId, text: "", sender: "ai" }]);

    try {
      const response = await fetch(apiConfig.endpoints.ask, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.slice(6);
            if (text) {
              accumulatedText += text;
              setMessages((prev) =>
                prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
              );
            } else {
              accumulatedText += "\n";
              setMessages((prev) =>
                prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
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
          id: `ai_error_${Date.now()}`,
          text: "Error: Could not get a response. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsSending(false);
      setStreamingMessageId(null); // Clear streaming state
    }
  };

  useEffect(() => {
    const prepareDocument = async () => {
      // Reset preparation state when ID changes
      if (currentDocumentIdRef.current !== id) {
        preparationAttemptedRef.current = false;
        currentDocumentIdRef.current = id;
        setIsDocumentReady(false);
        setIsPreparing(true);
        setMessages([]); // Clear messages for new document
      }

      // Prevent multiple preparation attempts for the same document
      if (preparationAttemptedRef.current || !id) {
        if (preparationAttemptedRef.current) {
          console.log("Document preparation already attempted for ID:", id);
        }
        return;
      }

      preparationAttemptedRef.current = true;

      try {
        console.log("Preparing document with ID:", id);
        const response = await fetch(apiConfig.endpoints.getReady(id), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.message === "Case ready") {
          console.log("Document is ready, enabling chat");
          setIsDocumentReady(true);

          // Check if this was already prepared
          const welcomeMessage =
            data.status === "already_prepared"
              ? "Hello! Your document was already prepared and ready. I'm here to answer any questions you have about its legal content, provisions, precedents, or any other aspects. How can I assist you today?"
              : "Hello! Your document has been successfully prepared. I'm ready to answer any questions you have about its legal content, provisions, precedents, or any other aspects. How can I assist you today?";

          setMessages((prev) => [
            ...prev,
            {
              id: `ai_welcome_${Date.now()}`,
              text: welcomeMessage,
              sender: "ai",
            },
          ]);
        } else if (data.error) {
          console.error("Document preparation error:", data.error);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_error_${Date.now()}`,
              text: `Error: ${data.error}`,
              sender: "ai",
            },
          ]);
        } else {
          console.warn("Unexpected response format:", data);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_unexpected_${Date.now()}`,
              text: "Document preparation completed, but received unexpected response format.",
              sender: "ai",
            },
          ]);
        }
      } catch (error) {
        console.error("Error preparing document:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_prep_error_${Date.now()}`,
            text: "Failed to prepare the document. Please try again.",
            sender: "ai",
          },
        ]);
      } finally {
        setIsPreparing(false);
      }
    };

    if (id) {
      prepareDocument();
    } else {
      console.error("No document ID provided");
      setIsPreparing(false);
    }
  }, [id]);

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

      <div className="z-10 flex items-center justify-center flex-col h-screen py-6">
        <Card
          className={`w-full max-w-5xl h-full flex flex-col backdrop-blur-sm bg-background/80 border shadow-xl ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Chat Header */}
          <div
            className={`px-6 py-4 border-b flex items-center gap-3 ${
              isDarkMode ? "border-gray-700 bg-background/50" : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Legal Assistant</h2>
              <p className="text-sm text-muted-foreground">
                {isPreparing ? "Preparing document..." : isDocumentReady ? "Ready to help" : "Initializing..."}
              </p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div
            className="flex-grow overflow-y-auto px-6 py-4 scrollbar-hide"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {/* Debug info - only in development */}
            {import.meta.env.DEV && (
              <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs">
                <details className="cursor-pointer">
                  <summary className="font-medium text-warning mb-2">Debug Information</summary>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <strong>Document ID:</strong> {id}
                    </div>
                    <div>
                      <strong>Is Preparing:</strong> {isPreparing.toString()}
                    </div>
                    <div>
                      <strong>Is Document Ready:</strong> {isDocumentReady.toString()}
                    </div>
                    <div>
                      <strong>Is Sending:</strong> {isSending.toString()}
                    </div>
                    <div>
                      <strong>Messages Count:</strong> {messages.length}
                    </div>
                    <div>
                      <strong>Input Length:</strong> {inputText.length}
                    </div>
                  </div>
                </details>
              </div>
            )}

            {isPreparing && (
              <div className="flex flex-col justify-center items-center h-full min-h-[400px]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Bot className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Preparing Your Document</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Initializing document analysis and preparation for interactive legal chat... Please note: As this
                    process leverages free-tier AI resources, document readiness might take slightly longer. We
                    appreciate your patience.
                  </p>
                  <div className="flex justify-center gap-1 mt-4">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - when document is ready but no messages */}
            {!isPreparing && messages.length === 0 && isDocumentReady && (
              <div className="flex flex-col justify-center items-center h-full min-h-[400px]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Bot className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Help!</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Your document is now ready. Ask me anything about the legal content, and I&apos;ll provide detailed
                    answers.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-default-100 rounded-full text-xs text-muted-foreground">
                      Ask about provisions
                    </span>
                    <span className="px-3 py-1 bg-default-100 rounded-full text-xs text-muted-foreground">
                      Legal precedents
                    </span>
                    <span className="px-3 py-1 bg-default-100 rounded-full text-xs text-muted-foreground">
                      Case summary
                    </span>
                  </div>
                </div>
              </div>
            )}
            {messages.map((message) => {
              const isStreaming = message.id === streamingMessageId;

              // Debug log for each message rendering
              if (import.meta.env.DEV) {
                console.log(
                  `Rendering message: ID=${message.id}, Sender=${message.sender}, Text=${message.text?.substring(
                    0,
                    50
                  )}...`
                );
              }

              return (
                <div
                  key={message.id}
                  className={`mb-6 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "user" ? (
                    // User message - right aligned
                    <div className="flex items-end gap-3 max-w-[75%]">
                      <div className="relative">
                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mb-1">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // AI message - left aligned
                    <div className="flex items-start gap-3 max-w-[75%]">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-secondary" />
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-background border border-default-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                          {message.text ? (
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                              {isStreaming && (
                                <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current align-middle"></span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 py-1">
                              <div
                                className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Scroll to bottom button */}
          {!isAtBottom && messages.length > 0 && (
            <Button
              isIconOnly
              color="primary"
              variant="shadow"
              radius="full"
              size="sm"
              className="absolute bottom-32 right-6 z-10 shadow-lg hover:shadow-xl transition-shadow"
              onClick={scrollToBottom}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
          {/* Input Area */}
          <div
            className={`px-6 py-4 border-t ${
              isDarkMode ? "border-gray-700 bg-background/50" : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-end gap-3">
              <div className="flex-grow">
                <Textarea
                  autoFocus
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !isDocumentReady
                      ? "Document is being prepared..."
                      : isSending
                      ? "Sending your message..."
                      : "Type your question about the document..."
                  }
                  className="w-full"
                  minRows={1}
                  maxRows={4}
                  ref={textareaRef}
                  classNames={{
                    base: "w-full",
                    inputWrapper: `border-2 ${
                      isDarkMode ? "border-gray-600 bg-background/50" : "border-gray-300 bg-white"
                    } hover:border-primary-400 focus-within:border-primary-500 transition-colors`,
                    input: "text-foreground placeholder:text-muted-foreground",
                  }}
                  disabled={!isDocumentReady || isSending}
                />
              </div>
              <Button
                isIconOnly
                color="primary"
                size="lg"
                variant={inputText.trim() && !isSending ? "solid" : "flat"}
                onClick={handleSendMessage}
                isDisabled={!inputText.trim() || !isDocumentReady || isSending}
                isLoading={isSending}
                className="min-w-12 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {/* Input hints */}
            {isDocumentReady && !isSending && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send</span>
                <span>•</span>
                <span>Shift + Enter for new line</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
