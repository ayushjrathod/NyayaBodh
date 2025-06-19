import {
  Avatar,
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { Mic, MicOff, MoonIcon, Send, SunIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useSpeechToText } from "../../components/SpeechToText/useSpeechToText";
import { toggleTheme } from "../../store/slices/themeSlice";

const LandingSearchSemantic = () => {
  const [query, setQuery] = useState("");
  const user = useSelector((state) => state.user);
  const { isListening, transcript, toggleListening, isSupported } = useSpeechToText();

  const textareaRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;

      setQuery(value.substring(0, start) + "\n" + value.substring(end));

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

  useEffect(() => {
    setQuery(transcript);
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    toggleListening();
  };

  const handleSendMessage = () => {
    navigate("/results", {
      state: {
        query,
        selectedSearch: "semantic",
      },
    });
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-poppins">
      {/* Enhanced Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] opacity-60"></div>

      {/* Enhanced Radial Gradient */}
      <div
        className={`absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full ${
          isDarkMode
            ? "bg-[radial-gradient(circle_600px_at_50%_200px,#fbfbfb15,transparent_70%)]"
            : "bg-[radial-gradient(circle_600px_at_50%_200px,#d5c5ff25,transparent_70%)]"
        } blur-3xl`}
      ></div>

      {/* Enhanced Top Navigation */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50 animate-fade-in-scale">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full glass-morphism">
          <Switch
            defaultSelected={isDarkMode}
            size="lg"
            color="primary"
            startContent={<SunIcon className="text-yellow-500" />}
            endContent={<MoonIcon className="text-purple-400" />}
            onChange={handleToggle}
            classNames={{
              wrapper: "group-data-[selected=true]:bg-primary",
            }}
          />
        </div>

        <Dropdown
          className={`z-50 ${isDarkMode && "yellow-bright"} text-foreground bg-background`}
          placement="bottom-end"
          classNames={{
            content: "glass-morphism shadow-xl",
          }}
        >
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-all duration-200 interactive-hover ring-2 ring-primary/20 hover:ring-primary/40 focus-enhanced"
              color="primary"
              name={user.name}
              size="md"
              src={user.picture}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="signinas" className="h-14 gap-2 cursor-default opacity-60">
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Signed in as</p>
                <p className="font-semibold text-sm">{user.email}</p>
              </div>
            </DropdownItem>
            <DropdownItem key="profile" as={NavLink} to="/profile" className="gap-2">
              <span className="text-sm">Profile</span>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={() => handleLogout()} className="gap-2">
              <span className="text-sm">Log Out</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Enhanced Main Content */}
      <div className="relative z-10 flex items-center justify-center flex-col h-full px-4">
        <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in-up">
          {/* Enhanced Hero Title */}
          <div className="text-center mb-8 md:mb-12">
            <p
              className={`font-poppins hierarchy-1 bg-clip-text text-transparent text-center bg-gradient-to-b ${
                isDarkMode
                  ? "from-neutral-50 via-neutral-100 to-neutral-400"
                  : "from-neutral-900 via-neutral-700 to-neutral-500"
              } lg:text-4xl xl:text-6xl tracking-tight leading-tight`}
            >
              Semantic Search
              <br />
              <span className="text-gradient">Legal Intelligence</span>
            </p>
            <p
              className={`mt-4 md:mt-6 text-lg md:text-xl ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              } max-w-2xl mx-auto leading-relaxed`}
            >
              Discover deep legal insights with advanced semantic search and AI analysis
            </p>
          </div>

          {/* Enhanced Search Card */}
          <Card
            className={`w-full max-w-3xl card-enhanced shadow-2xl transition-all duration-300 ${
              isDarkMode ? "glass-morphism shadow-black/20" : "glass-morphism shadow-neutral-900/10"
            }`}
          >
            <div className="p-6 md:p-8">
              {/* Search Input Container */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label
                    className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                  >
                    Describe your legal scenario or question
                  </label>
                  <Textarea
                    autoFocus
                    ref={textareaRef}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Explain your legal scenario, describe a case, or ask about legal concepts..."
                    className="flex-grow resize-none form-enhanced"
                    minRows={1}
                    maxRows={4}
                    variant="bordered"
                    classNames={{
                      input: `${
                        isDarkMode
                          ? "text-white placeholder:text-neutral-400"
                          : "text-neutral-900 placeholder:text-neutral-500"
                      } text-base leading-relaxed`,
                      inputWrapper: `border-2 transition-all duration-200 ${
                        isDarkMode
                          ? "border-neutral-600 hover:border-neutral-500 focus-within:border-primary-400"
                          : "border-neutral-300 hover:border-neutral-400 focus-within:border-primary-500"
                      } bg-transparent backdrop-blur-sm focus-enhanced`,
                    }}
                  />
                </div>
                {/* Voice Input Button */}
                <Button
                  isIconOnly
                  radius="full"
                  size="lg"
                  color={isListening ? "danger" : "primary"}
                  variant={isListening ? "solid" : "bordered"}
                  onClick={handleVoiceToggle}
                  isDisabled={!isSupported}
                  className={`mb-0 btn-hover-lift transition-all duration-200 ${
                    isListening
                      ? "animate-pulse shadow-lg shadow-danger-500/25"
                      : "hover:shadow-lg hover:shadow-primary-500/25"
                  } focus-enhanced ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                  title={!isSupported ? "Speech recognition not supported in this browser" : undefined}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                {/* Send Button */}
                <Button
                  isIconOnly
                  radius="full"
                  size="lg"
                  color="primary"
                  variant={query.trim() ? "solid" : "bordered"}
                  onClick={handleSendMessage}
                  isDisabled={!query.trim()}
                  className={`mb-0 btn-hover-lift transition-all duration-200 ${
                    query.trim() ? "hover:shadow-lg hover:shadow-primary-500/25" : "opacity-50 cursor-not-allowed"
                  } focus-enhanced`}
                  aria-label="Search"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              {/* Search Features */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  🔍 Semantic Search
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  🧠 Contextual Analysis
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  🎤 Voice Input
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  📚 Legal Intelligence
                </span>
              </div>
              {/* Quick Examples */}
              <div className="mt-4">
                <p className={`text-xs mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                  Try explaining scenarios like:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "landlord refusing to return security deposit",
                    "workplace harassment and discrimination",
                    "breach of contract in business deal",
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className={`text-xs px-2 py-1 rounded transition-all duration-200 ${
                        isDarkMode
                          ? "text-primary-400 hover:bg-primary-400/10 hover:text-primary-300"
                          : "text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Footer */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`}>
              Press{" "}
              <kbd
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                Enter
              </kbd>{" "}
              to search or{" "}
              <kbd
                className={`px-2 py-1 rounded text-xs ${
                  isDarkMode ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                Shift + Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSearchSemantic;
