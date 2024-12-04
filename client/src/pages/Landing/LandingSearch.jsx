import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { FileText, Globe, MoonIcon, Paperclip, Send, SunIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toggleTheme } from "../../store/slices/themeSlice";

const LandingSearch = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const [query, setQuery] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [selectedParam, setSelectedParam] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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
    if (file) {
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: file.size,
      });
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

      // Insert newline
      setQuery(value.substring(0, start) + "\n" + value.substring(end));

      // Move cursor to the new line
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
  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  const handleSendMessage = () => {
    navigate("/results", {
      state: {
        query,
        selectedSearch,
        selectedParam,
        selectedSpace,
        selectedFile,
      },
    });
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-Poppins">
      {/* background */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>




      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <Switch
          defaultSelected={isDarkMode}
          size="lg"
          color="primary"
          startContent={<SunIcon />}
          endContent={<MoonIcon />}
          onChange={handleToggle}
        />
        {
          !isAuthenticated ? (

            <Button color="primary" className="absolute top-4 right-4 z-50" variant="flat" onClick={() => loginWithRedirect()}>
              {'Login'}
            </Button>

          ) : (
            <Dropdown className=' absolute top-4 right-4 z-50 text-foreground bg-background' placement="bottom-end" classNames={{
              content: "border-small border-divider bg-background",
            }}>
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
                  <p className="font-semibold">{'Signed in as'}</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="profile" as={Link} href="/profile">
                  {'Profile'}
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={() => logoutWithRedirect()}>
                  {'Log Out'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        }
      </div>



      {/* chat container */}
      <div className="relative z-10 flex items-center justify-center flex-col h-full">
        <div className="w-full max-w-4xl h-[80vh] flex flex-col">
          <h2 className="font-Poppins bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-100 to-neutral-500 text-2xl md:text-4xl lg:text-7xl py-2 md:py-10 font-semibold tracking-tight">
            AI-Powered <br />
            Research Assistant
          </h2>
          <Card className="w-full backdrop-blur-[1px]  bg-slate-300/5 border border-gray-800">
            <div className="p-4">
              {selectedFile && (
                <div className="flex items-center bg-slate-700/30 p-2 rounded-lg mb-2">
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

              {/*filters*/}
              <div className="grid grid-cols-2 gap-2 mb-2 w-3/5">
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
                    trigger: "bg-transparent",
                    value: "text-small text-white",
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
              </div>

              {/*input*/}
              <div className="flex items-center space-x-2">
                {/*File upload*/}
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                  <label htmlFor="file-upload">
                    <Button isIconOnly variant="light" as="span" className="text-white">
                      <Paperclip className="w-5 h-5 text-white" />
                    </Button>
                  </label>
                </div>

                {/* Textarea */}
                <Textarea
                  ref={textareaRef}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Write your query..."
                  className="flex-grow bg-transparent border-none text-white resize-none overflow-hidden p-2 outline-none"
                  minRows={1}
                  classNames={{
                    input: "bg-transparent text-white",
                    inputWrapper: "bg-transparent  ",
                  }}
                />

                {/* Send Button */}
                <Button
                  isIconOnly
                  color="primary"
                  variant={query.trim() || selectedFile ? "solid" : "light"}
                  onClick={handleSendMessage}
                  isDisabled={!query.trim() && !selectedFile}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingSearch;
