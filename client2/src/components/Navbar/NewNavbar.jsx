import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Switch,
} from "@nextui-org/react";
import { Menu, MoonIcon, SunIcon, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout as apiLogout } from "../../api/axios";
import logoNB from "../../assets/logoNB.png";
import { setAuthState } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/themeSlice";
import { getDropdownThemeClasses } from "../../utils/themeUtils";
import ScreenReader from "../ScreenReader/ScreenReader";
import GoogleTranslate from "./GoogleTranslator";

function NewNavBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    await apiLogout();
    dispatch(setAuthState(false));
    navigate("/");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explain Scenario", path: "/semantic" },
    { name: "Law Lookup", path: "/lawlookup" },
    { name: "Contact Us", path: "/contact" },
    ...(userRole === "ADMIN" ? [{ name: "DocGen", path: "/docgen" }] : []),
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Navbar 
      isBordered 
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      className="bg-background/95 backdrop-blur-md border-b border-divider"
      classNames={{
        wrapper: "px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
        content: "gap-4 justify-between",
        brand: "flex-grow-0",
        item: "hidden sm:flex",
        menu: "pt-6 bg-background/95 backdrop-blur-md",
        menuItem: "w-full",
      }}
    >
      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-foreground hover:text-primary transition-colors"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </NavbarMenuToggle>
      </NavbarContent>

      {/* Brand - Centered on mobile, left on desktop */}
      <NavbarBrand className="flex items-center gap-2 justify-center sm:justify-start">
        <img 
          alt="NyayBodh Logo" 
          src={logoNB} 
          className="h-8 w-8" 
          loading="lazy"
        />
        <span className="font-bold text-xl text-foreground notranslate hidden sm:block">
          NYAAYBODH
        </span>
        <span className="font-bold text-lg text-foreground notranslate sm:hidden">
          NB
        </span>
      </NavbarBrand>

      {/* Desktop Navigation - Centered */}
      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive 
                    ? "text-primary bg-primary/10 after:w-full" 
                    : "text-foreground hover:text-primary after:w-0"
                } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:bg-primary after:transition-all after:duration-300 after:-translate-x-1/2`
              }
              onClick={closeMenu}
            >
              {item.name}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Right side controls - Centered vertically */}
      <NavbarContent justify="end" className="gap-3 items-center">
        {/* Theme toggle */}
        <NavbarItem>
          <Switch
            defaultSelected={isDarkMode}
            size="md"
            color="primary"
            startContent={<SunIcon className="w-3 h-3" />}
            endContent={<MoonIcon className="w-3 h-3" />}
            onChange={handleToggle}
            aria-label="Toggle dark mode"
            classNames={{
              wrapper: "group-data-[selected=true]:bg-primary",
              thumb: "group-data-[selected=true]:ml-6",
            }}
          />
        </NavbarItem>

        {/* Google Translate - Desktop only */}
        <NavbarItem className="hidden md:flex">
          <div className="scale-90">
            <GoogleTranslate />
          </div>
        </NavbarItem>

        {/* Screen Reader - Desktop only */}
        <NavbarItem className="hidden md:flex">
          <ScreenReader />
        </NavbarItem>

        {/* User Avatar/Menu */}
        {isAuthenticated && (
          <NavbarItem>
            <Dropdown
              placement="bottom-end"
              className={getDropdownThemeClasses(isDarkMode)}
              classNames={{
                content: "border border-divider bg-background/95 backdrop-blur-md shadow-lg min-w-[200px]",
              }}
            >
              <DropdownTrigger>
                <Button
                  variant="light"
                  isIconOnly
                  className="transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`User menu for ${user.email || 'user'}`}
                >
                  <Avatar
                    showFallback
                    isBordered
                    className="transition-transform"
                    color="primary"
                    size="sm"
                    src={user.picture}
                    name={user.fullname || user.email}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="User Actions" 
                variant="flat"
              >
                <DropdownItem 
                  key="user-info" 
                  className="h-14 gap-2 cursor-default opacity-100" 
                  textValue="User information"
                >
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm">{user.fullname || "User"}</p>
                    <p className="text-xs text-default-500">{user.email}</p>
                    <p className="text-xs text-primary capitalize">{user.role?.toLowerCase()}</p>
                  </div>
                </DropdownItem>
                <DropdownItem 
                  key="profile" 
                  textValue="Profile"
                  onPress={() => navigate("/profile")}
                  className="gap-2"
                >
                  <span className="text-sm">Profile</span>
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger" 
                  onClick={handleLogout}
                  textValue="Log Out"
                  className="text-danger"
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="pt-6 gap-4">
        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-${index}`}>
              <NavLink
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `w-full text-left px-4 py-3 text-base font-medium transition-all duration-300 rounded-lg hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive 
                      ? "text-primary bg-primary/10 border-l-4 border-primary" 
                      : "text-foreground hover:text-primary hover:translate-x-1"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </NavbarMenuItem>
          ))}
        </div>
        
        {/* Mobile-only controls */}
        <div className="mt-6 pt-6 border-t border-divider space-y-4">
          <div className="flex items-center justify-between px-4">
            <span className="text-sm font-medium text-foreground">Language</span>
            <div className="scale-90">
              <GoogleTranslate />
            </div>
          </div>
          <div className="flex items-center justify-between px-4">
            <span className="text-sm font-medium text-foreground">Accessibility</span>
            <ScreenReader />
          </div>
        </div>

        {/* User info in mobile menu */}
        {isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-divider">
            <div className="flex items-center gap-3 px-4 py-3 bg-default-50 rounded-lg">
              <Avatar
                showFallback
                size="sm"
                src={user.picture}
                name={user.fullname || user.email}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.fullname || "User"}
                </p>
                <p className="text-xs text-default-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="light"
              className="w-full mt-3 justify-start"
              onClick={() => {
                closeMenu();
                navigate("/profile");
              }}
            >
              View Profile
            </Button>
            <Button
              variant="light"
              color="danger"
              className="w-full mt-2 justify-start"
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
            >
              Log Out
            </Button>
          </div>
        )}
      </NavbarMenu>
    </Navbar>
  );
}

export default NewNavBar;