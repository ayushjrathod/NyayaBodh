import {
  Avatar,
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch,
  Tab,
  Tabs,
  Textarea,
} from "@nextui-org/react";
import { FileText, MoonIcon, Send, SunIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { toggleTheme } from "../../store/slices/themeSlice";

const LandingSearchSemantic = () => {
  const [query, setQuery] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedParam, setSelectedParam] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("");
  const user = useSelector((state) => state.user);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file); // Pass the entire File object
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleSendMessage = () => {
    navigate("/results", {
      state: {
        query,
        selectedSearch: "semantic",
      },
    });
  };

  const handlePdfSend = () => {
    navigate("/summary/pdf", {
      state: {
        selectedFile,
      },
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-primary");
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-primary");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-primary");
    }
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file); // Pass the entire File object
    } else {
      alert("Please upload a PDF file.");
    }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-Poppins">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div
        className={`absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full ${
          isDarkMode
            ? "bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"
            : "bg-[radial-gradient(circle_400px_at_50%_300px,#d5c5ff,#ffffff80)]"
        } `}
      ></div>

      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <Switch
          defaultSelected={isDarkMode}
          size="lg"
          color="primary"
          startContent={<SunIcon />}
          endContent={<MoonIcon />}
          onChange={handleToggle}
        />
        <Dropdown
          className={` z-50 ${isDarkMode && "yellow-bright"} text-foreground bg-background `}
          placement="bottom-end"
          classNames={{
            content: "border-small border-divider bg-background",
          }}
        >
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              name={user.name}
              size="sm"
              src={user.picture}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="signinas" className="h-14 gap-2 cursor-default">
              <p className="font-semibold">{"Signed in as"}</p>
              <p className="font-semibold">{user.email}</p>
            </DropdownItem>
            <DropdownItem key="profile" as={NavLink} to="/profile">
              {"Profile"}
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={() => handleLogout()}>
              {"Log Out"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="relative z-10 flex items-center justify-center flex-col h-full">
        <div className="w-full max-w-4xl h-[80vh] flex flex-col">
          <h2
            className={` p-6 font-Poppins bg-clip-text text-transparent text-center bg-gradient-to-b ${
              isDarkMode ? "from-neutral-100 to-neutral-500" : "from-black to-neutral-500"
            } text-2xl md:text-4xl lg:text-7xl py-2 md:py-10 font-semibold tracking-tight`}
          >
            Explain Scenario <br />
            To get Results
          </h2>

          {/* <Tabs className="z-50" aria-label="Search Options">
            <Tab key="text" title="Text Input"> */}
              <Card className={`w-full border  ${isDarkMode && "backdrop-blur-[1px] bg-slate-300/5  border-gray-800"}`}>
                <div className="p-4">
                  {/* <div className={`grid grid-cols-2 gap-2 mb-2 w-3/5 `}>
                    <Select
                      label="Search Type"
                      selectedKeys={selectedSearch ? [selectedSearch] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        setSelectedSearch(selected);
                        setSelectedParam("");
                        setSelectedSpace("");
                      }}
                      startContent={<Globe className="w-4 h-4 text-default-400" />}
                      classNames={{
                        trigger: "bg-transparent ",
                        value: "text-small text-white",
                        popoverContent: ` ${isDarkMode && "dark"} bg-background text-foreground`,
                      }}
                    >
                      <SelectItem key="Semantic Search" value="Semantic Search">
                        Semantic Search
                      </SelectItem>
                      <SelectItem key="Entity Search" value="Entity Search">
                        Entity Search
                      </SelectItem>
                    </Select>

                    {selectedSearch === "Entity Search" && (
                      <Select
                        label="Select Entity"
                        selectedKeys={selectedParam ? [selectedParam] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          setSelectedParam(selected);
                        }}
                        classNames={{
                          trigger: "bg-transparent",
                          value: "text-small text-white",
                          popoverContent: ` ${isDarkMode && "dark"} bg-background text-foreground`,
                        }}
                      >
                        <SelectItem key="lawyer" value="lawyer">
                          Search for lawyer names
                        </SelectItem>
                        <SelectItem key="judge" value="judge">
                          Search for judge names
                        </SelectItem>
                        <SelectItem key="gpe" value="gpe">
                          Search for geographical entities
                        </SelectItem>
                        <SelectItem key="court" value="court">
                          Search for the court name
                        </SelectItem>
                        <SelectItem key="org" value="org">
                          Search for organization names
                        </SelectItem>
                        <SelectItem key="petitioner" value="petitioner">
                          Search for the petitioner name
                        </SelectItem>
                        <SelectItem key="respondent" value="respondent">
                          Search for the respondent name
                        </SelectItem>
                        <SelectItem key="statute" value="statute">
                          Search for statutes or laws
                        </SelectItem>
                      </Select>
                    )}

                    {selectedSearch === "Semantic Search" && (
                      <Select
                        label="Select Space"
                        selectedKeys={selectedSpace ? [selectedSpace] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          setSelectedSpace(selected);
                        }}
                        classNames={{
                          trigger: "bg-transparent",
                          value: "text-small text-white",
                          popoverContent: ` ${isDarkMode && "dark"} bg-background text-foreground`,
                        }}
                      >
                        <SelectItem key="all" value="all">
                          Space:General
                        </SelectItem>
                        <SelectItem key="judgements" value="judgements">
                          Space:Issues
                        </SelectItem>
                        <SelectItem key="orders" value="orders">
                          Space:Laws
                        </SelectItem>
                      </Select>
                    )}
                  </div> */}

                  <div className="flex items-center space-x-2">
                    <Textarea
                      autoFocus
                      ref={textareaRef}
                      value={query}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Write your query..."
                      className="flex-grow bg-transparent border-none text-white resize-none overflow-hidden p-2 outline-none"
                      minRows={1}
                      classNames={{
                        input: "bg-transparent text-white",
                        inputWrapper: "bg-transparent",
                      }}
                    />

                    <Button
                      isIconOnly
                      color="primary"
                      variant={query.trim() ? "solid" : "light"}
                      onClick={handleSendMessage}
                      isDisabled={!query.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            {/* </Tab>
         
            <Tab key="upload" title="Upload Document">
              <Card className={`w-full border  ${isDarkMode && "backdrop-blur-[1px] bg-slate-300/5  border-gray-800"}`}>
                <div className="p-4">
                  <div
                    ref={dropZoneRef}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer transition-colors duration-300 ease-in-out"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF only (up to 10MB)</p>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 flex items-center bg-slate-700/30 p-2 rounded-lg">
                      <FileText className="w-6 h-6 mr-2 text-white" />
                      <div className="flex-grow">
                        <p className="text-white text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button isIconOnly variant="light" size="sm" onClick={handleRemoveFile}>
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      color="primary"
                      variant={selectedFile ? "solid" : "light"}
                      onClick={handlePdfSend}
                      isDisabled={!selectedFile}
                    >
                      Send
                    </Button>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <p>Instructions:</p>
                    <ul className="list-disc pl-5">
                      <li>Upload a PDF document (max 10MB)</li>
                      <li>The AI will analyze the document and provide insights</li>
                      <li>You can ask questions about the uploaded document</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </Tab>
          </Tabs> */}
        </div>
      </div>
    </div>
  );
};

export default LandingSearchSemantic;
