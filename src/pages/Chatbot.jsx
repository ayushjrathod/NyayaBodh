import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import ChatInput from "../components/Chatbot/ChatInput";
import ChatMessages from "../components/Chatbot/ChatMessages";
import DrawerBackdrop from "../components/Chatbot/DrawerBackdrop";
import Navbar from "../components/Chatbot/Navbar";
import Sidebar from "../components/Chatbot/Sidebar";
import {
  chatIdState,
  chatsState,
  drawerOpenState,
  initialChatMessagesState,
  inputState,
  messagesState,
} from "../utils/recoil/atoms";

function Chatbot() {
  const [drawerOpen, setDrawerOpen] = useRecoilState(drawerOpenState);
  const [chatId, setChatId] = useRecoilState(chatIdState);
  const [messages, setMessages] = useRecoilState(messagesState);
  const [input, setInput] = useRecoilState(inputState);
  const [chats, setChats] = useRecoilState(chatsState);
  const [initialChatMessages, setInitialChatMessages] = useRecoilState(initialChatMessagesState);

  const location = useLocation();
  const { data } = location.state || {};
  setInitialChatMessages(data);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const openChat = (id) => {
    setChatId(id);
    setMessages(initialChatMessages[id] || []);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const newChat = () => {
    const newId = Date.now();
    const newTitle = prompt("Enter new chat title name") || "Untitled Chat";
    setChatId(newId);
    setMessages([
      {
        role: "assistant",
        content: [{ text: "Hello! How can I help you today?" }],
      },
    ]);
    setChats((prevChatsArray) => [...prevChatsArray, { id: newId, title: newTitle }]);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      console.log("starting fetch");
      const response = await fetch(`http://127.0.0.1:8000/chat`, {
        method: "POST",
        body: JSON.stringify({ query: input }),
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Using a reader for streaming
      const reader = response.body.getReader();
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

      // Remove the redundant response.json() call
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Uploading file: ${file.name}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload", {
          method: "POST",
          body: formData,
          mode: "cors",
        });

        if (response.ok) {
          const result = await response.json();
          console.log("File uploaded successfully:", result);

          const fileMessage = {
            role: "user",
            content: [{ text: `Uploaded file: ${file.name}` }],
          };
          setMessages((prev) => [...prev, fileMessage]);

          if (result.fileUrl) {
            window.open(result.fileUrl, "_blank");
          }

          setInput(`I've just uploaded a file named ${file.name}. Can you analyze it?`);
          handleSendMessage();
        } else {
          console.error("File upload failed");
          const errorMessage = {
            role: "assistant",
            content: [{ text: "Sorry, there was an error uploading the file." }],
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        const errorMessage = {
          role: "assistant",
          content: [{ text: "Sorry, there was an error uploading the file." }],
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  return (
    <div className="antialiased bg-gray-50">
      <Navbar toggleDrawer={toggleDrawer} />

      {drawerOpen && <DrawerBackdrop onClick={toggleDrawer} />}

      <Sidebar chats={chats} chatId={chatId} openChat={openChat} newChat={newChat} drawerOpen={drawerOpen} />

      <main className="p-4 md:ml-64 pt-20 h-screen">
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full py-2">
          <div className="h-full overflow-x-auto mb-2">
            <ChatMessages messages={messages} />
            <div ref={messagesEndRef} />
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            inputRef={inputRef}
            handleFileUpload={handleFileUpload}
          />
        </div>
      </main>
    </div>
  );
}

export default Chatbot;
