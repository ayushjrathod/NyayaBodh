import {
  Avatar,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch,
} from "@nextui-org/react";
import { Mic, MicOff, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useSpeechToText } from "../../components/SpeechToText/useSpeechToText";
import { 
  Button, 
  SearchInput, 
  useResponsive, 
  AccessibleButton, 
  LiveRegion 
} from "../../components/ui";
import { toggleTheme } from "../../store/slices/themeSlice";
import { getDropdownThemeClasses } from "../../utils/themeUtils";

const LandingSearch = () => {
  const [query, setQuery] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const user = useSelector((state) => state.user);
  const { isListening, transcript, toggleListening, isSupported } = useSpeechToText();
  const { isMobile, isTablet } = useResponsive();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
    setAnnounceMessage(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    setQuery(transcript);
    if (transcript) {
      setAnnounceMessage(`Voice input: ${transcript}`);
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (!isSupported) {
      setAnnounceMessage("Speech recognition is not supported in this browser");
      return;
    }
    toggleListening();
    setAnnounceMessage(isListening ? "Voice input stopped" : "Voice input started");
  };

  const handleSendMessage = () => {
    if (!query.trim()) {
      setAnnounceMessage("Please enter a search query");
      return;
    }
    
    setAnnounceMessage("Searching for entity results");
    navigate("/results", {
      state: {
        query,
        selectedSearch: "entity",
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSendMessage();
    }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-poppins">
      <LiveRegion message={announceMessage} />
      
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
      <header className="absolute top-4 right-4 flex items-center gap-3 z-50 animate-fade-in-scale">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full glass-morphism">
          <Switch
            defaultSelected={isDarkMode}
            size={isMobile ? "md" : "lg"}
            color="primary"
            startContent={<SunIcon className="text-yellow-500" />}
            endContent={<MoonIcon className="text-purple-400" />}
            onChange={handleToggle}
            aria-label="Toggle dark mode"
            classNames={{
              wrapper: "group-data-[selected=true]:bg-primary",
            }}
          />
        </div>
        
        <Dropdown
          className={getDropdownThemeClasses(isDarkMode)}
          placement="bottom-end"
          classNames={{
            content: "glass-morphism shadow-xl",
          }}
        >
          <DropdownTrigger>
            <AccessibleButton
              variant="light"
              isIconOnly
              ariaLabel={`User menu for ${user.email || 'user'}`}
              className="transition-all duration-200 interactive-hover ring-2 ring-primary/20 hover:ring-primary/40 focus-enhanced"
            >
              <Avatar
                isBordered
                color="primary"
                name={user.name}
                size={isMobile ? "sm" : "md"}
                src={user.picture}
              />
            </AccessibleButton>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="signinas" className="h-14 gap-2 cursor-default opacity-60" textValue="Signed in as">
              <div className="flex flex-col">
                <p className="text-xs text-default-500">Signed in as</p>
                <p className="font-semibold text-sm">{user.email}</p>
              </div>
            </DropdownItem>
            <DropdownItem key="profile" as={NavLink} to="/profile" className="gap-2" textValue="Profile">
              <span className="text-sm">Profile</span>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={() => handleLogout()} className="gap-2" textValue="Log Out">
              <span className="text-sm">Log Out</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </header>

      {/* Enhanced Main Content */}
      <main className="relative z-10 flex items-center justify-center flex-col h-full px-4">
        <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in-up">
          {/* Enhanced Hero Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1
              className={`font-poppins hierarchy-1 bg-clip-text text-transparent text-center bg-gradient-to-b ${
                isDarkMode
                  ? "from-neutral-50 via-neutral-100 to-neutral-400"
                  : "from-neutral-900 via-neutral-700 to-neutral-500"
              } ${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'lg:text-4xl xl:text-6xl'} tracking-tight leading-tight`}
            >
              AI-Powered
              <br />
              <span className="text-gradient">Research Assistant</span>
            </h1>
            <p
              className={`mt-4 md:mt-6 ${isMobile ? 'text-base' : 'text-lg md:text-xl'} ${
                isDarkMode ? "text-neutral-400" : "text-neutral-600"
              } max-w-2xl mx-auto leading-relaxed`}
            >
              Discover legal insights with advanced AI-powered search and analysis
            </p>
          </div>

          {/* Enhanced Search Card */}
          <Card
            className={`w-full max-w-3xl card-enhanced shadow-2xl transition-all duration-300 ${
              isDarkMode ? "glass-morphism shadow-black/20" : "glass-morphism shadow-neutral-900/10"
            }`}
            role="search"
            aria-label="Legal research search"
          >
            <div className={`${isMobile ? 'p-4' : 'p-6 md:p-8'}`}>
              {/* Search Input Container */}
              <div className="space-y-4">
                <label
                  htmlFor="search-input"
                  className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}
                >
                  What would you like to research?
                </label>
                
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <SearchInput
                      id="search-input"
                      value={query}
                      onChange={handleInputChange}
                      onSubmit={handleSendMessage}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your legal query, case details, or ask a question..."
                      aria-describedby="search-description"
                    />
                  </div>
                  
                  {/* Voice Input Button */}
                  <AccessibleButton
                    isIconOnly
                    radius="full"
                    size="lg"
                    color={isListening ? "danger" : "primary"}
                    variant={isListening ? "solid" : "bordered"}
                    onClick={handleVoiceToggle}
                    disabled={!isSupported}
                    ariaLabel={isListening ? "Stop voice input" : "Start voice input"}
                    ariaPressed={isListening}
                    className={`mb-0 ${
                      isListening
                        ? "animate-pulse shadow-lg shadow-danger-500/25"
                        : "hover:shadow-lg hover:shadow-primary-500/25"
                    } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </AccessibleButton>
                </div>
                
                <div id="search-description" className="sr-only">
                  Use this search to find legal cases, statutes, and legal information. You can type your query or use voice input.
                </div>
              </div>

              {/* Search Features */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: "🔍", text: "Entity Search" },
                  { icon: "🧠", text: "AI-Powered Analysis" },
                  { icon: "🎤", text: "Voice Input" }
                ].map((feature, index) => (
                  <span
                    key={index}
                    className={`text-xs px-3 py-1 rounded-full ${
                      isDarkMode
                        ? "bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                    role="img"
                    aria-label={feature.text}
                  >
                    {feature.icon} {feature.text}
                  </span>
                ))}
              </div>

              {/* Quick Examples */}
              <div className="mt-4">
                <p className={`text-xs mb-2 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                  Try asking about:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["contract law precedents", "property dispute cases", "criminal law statutes"].map(
                    (example, index) => (
                      <AccessibleButton
                        key={index}
                        variant="light"
                        size="sm"
                        onClick={() => setQuery(example)}
                        ariaLabel={`Search for ${example}`}
                        className={`text-xs px-2 py-1 rounded transition-all duration-200 ${
                          isDarkMode
                            ? "text-primary-400 hover:bg-primary-400/10 hover:text-primary-300"
                            : "text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                        }`}
                      >
                        {example}
                      </AccessibleButton>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Footer */}
          <footer className="mt-8 text-center">
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
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LandingSearch;