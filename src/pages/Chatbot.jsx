import { useState, useEffect, useRef } from "react";
import ChatMessages from "../components/Chatbot/ChatMessages";
import ChatInput from "../components/Chatbot/ChatInput";
import Sidebar from "../components/Chatbot/Sidebar";
import DrawerBackdrop from "../components/Chatbot/DrawerBackdrop";
import Navbar from "../components/Chatbot/Navbar";

function Chatbot() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const chats = [
    { id: 1, title: "Real Estate Dispute" },
    { id: 2, title: "Need Suggestion" },
    { id: 3, title: "Compare these disputes" },
  ];

  const initialChatMessages = {
    1: [
      {
        role: "assistant",
        content: [{ text: "Hello! How can I assist you today?" }],
      },
    ],
    2: [
      {
        role: "assistant",
        content: [
          { text: "Welcome to tech support. What issue are you experiencing?" },
        ],
      },
    ],
    3: [
      {
        role: "assistant",
        content: [{ text: "Hey there! Ready for some fun chat?" }],
      },
    ],
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openChat = (id) => {
    setChatId(id);
    setMessages(initialChatMessages[id] || []);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  const newChat = () => {
    const newId = Date.now();
    setChatId(newId);
    setMessages([
      {
        role: "assistant",
        content: [{ text: "Hello! How can I help you today?" }],
      },
    ]);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const assistantMessage = {
        role: "assistant",
        content: [{ text: generateResponse(input) }],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateResponse = (userInput) => {
    const lowercaseInput = userInput.toLowerCase();
    if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (lowercaseInput.includes("how are you")) {
      return "I'm doing well, thank you for asking! How about you?";
    } else if (
      lowercaseInput.includes("bye") ||
      lowercaseInput.includes("goodbye")
    ) {
      return "Goodbye! Have a great day!";
    } else if (lowercaseInput.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return (
        "I understand you're saying something about '" +
        userInput +
        "'. Could you please provide more details or ask a specific question?"
      );
    }
  };

  return (
    <div className="antialiased bg-gray-50">
      <Navbar toggleDrawer={toggleDrawer} />

      {drawerOpen && <DrawerBackdrop onClick={toggleDrawer} />}

      <Sidebar
        chats={chats}
        chatId={chatId}
        openChat={openChat}
        newChat={newChat}
        drawerOpen={drawerOpen}
      />

      <main className="p-4 md:ml-64 pt-20 h-screen">
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full py-2 px-4">
          <div className="h-full overflow-x-auto mb-6">
            <ChatMessages messages={messages} />
            <div ref={messagesEndRef} />
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            inputRef={inputRef}
          />
        </div>
      </main>
    </div>
  );
}

export default Chatbot;
