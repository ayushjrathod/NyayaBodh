import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "../components/Chatbot/ChatInput";
import ChatMessages from "../components/Chatbot/ChatMessages";
import DrawerBackdrop from "../components/Chatbot/DrawerBackdrop";
import Navbar from "../components/Chatbot/Navbar";
import Sidebar from "../components/Chatbot/Sidebar";

function Chatbot() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const id = useParams();

  const chats = [
    { id: 1, title: "General Chat" },
    { id: 2, title: "Tech Support" },
    { id: 3, title: "Commercial Dispute" },
  ];

  const initialChatMessages = {
    1: [
      {
        role: "assistant",
        content: [{ text: "Hello! How can I assist you today?" }],
      },
      {
        role: "user",
        content: [
          {
            text: "I need help with this dispute where a movie advertised itself with a song and in actaul movie the song was not there so one of the viewers sued the production house.",
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            text: "I see. I can help you with that. Can you provide me with more details?",
          },
        ],
      },
    ],
    2: [
      {
        role: "assistant",
        content: [{ text: "Welcome to tech support. What issue are you experiencing?" }],
      },
      {
        role: "user",
        content: [{ text: "I am having trouble with my computer. It keeps crashing." }],
      },
      {
        role: "assistant",
        content: [{ text: "I can help you with that. Have you tried restarting your computer?" }],
      },
    ],
    3: [
      {
        role: "assistant",
        content: [{ text: "Can you provide more details regarding your dispute?" }],
      },
      {
        role: "user",
        content: [
          {
            text: "So the dispute is regarding a commercial dispute where a company has not paid for the services provided by another company.",
          },
        ],
      },
    ],
  };

  const openChat = (id) => {
    setChatId(id);
    setMessages(initialChatMessages[id] || []);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  //Scroll to bottom when new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  //Handling user input
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      console.log("starting fetch");
      const response = fetch(`http://127.0.0.1:8000/ask/${id}`, {
        method: "POST",
        body: JSON.stringify({ query: input }),
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant", content: [{ text: "" }] };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content[0].text += chunk;
        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error receiving message:", error);
      const errorMessage = {
        role: "assistant",
        content: [{ text: "Sorry, something went wrong." }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="antialiased bg-gray-50">
      <Navbar toggleDrawer={toggleDrawer} />

      {drawerOpen && <DrawerBackdrop onClick={toggleDrawer} />}

      <Sidebar chats={chats} chatId={chatId} openChat={openChat} newChat={newChat} drawerOpen={drawerOpen} />

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
