import { Button, Input } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader, MessageCircle, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../utils/utils";

const SiteChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatboxRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("Sending message to API");
      const response = await fetch("https://whale-legal-api.onrender.com/ask/", {
        method: "POST",
        body: JSON.stringify({ question: inputValue }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
      console.log(messages);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 w-[380px] rounded-lg shadow-lg bg-white overflow-hidden"
          >
            {/* Header */}
            <div className="bg-secondary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Vidhi-Sevek</h3>
                  <p className="text-white/80 text-sm">How can I help you ?</p>
                </div>
              </div>
              <Button isIconOnly variant="light" onClick={() => setIsOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Messages */}
            <div className=" h-80 overflow-y-auto p-2 bg-gray-50">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 mb-3",
                      message.isUser ? "bg-secondary text-white ml-auto" : "bg-gray-500"
                    )}
                  >
                    {message.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  ref={inputRef}
                  className="flex-1"
                />
                <Button isIconOnly color="secondary" onClick={handleSendMessage}>
                  {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-secondary shadow-lg flex items-center justify-center"
        ref={buttonRef}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default SiteChatbot;
