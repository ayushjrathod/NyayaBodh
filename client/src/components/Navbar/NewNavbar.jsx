import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch,
} from "@nextui-org/react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { toggleTheme } from "../../store/slices/themeSlice";
import { logout } from "../../store/slices/userSlice";
import GoogleTranslate from "./GoogleTranslator";

function NewNavBar() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };



  const navItems = [
    { name: "Home", path: "/" },
    { name: "Recommend", path: "/recommend/1" },
    { name: "Law Lookup", path: "/lawlookup" },
    { name: "Contact Us", path: "/contact" },
    ...(user.role === "CLERK" ? [{ name: "DocGen", path: "/docgen" }] : []),
  ];

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <img alt="Logo" src="../src/assets/logoNB.png" className="h-8 w-8 mr-2" />
        <p className="font-bold text-inherit notranslate">NYAAYBODH</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? "text-primary font-semibold" : "text-foreground")}
            >
              {item.name}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Switch
            defaultSelected={isDarkMode}
            size="lg"
            color="primary"
            startContent={<SunIcon />}
            endContent={<MoonIcon />}
            onChange={handleToggle}
          />
        </NavbarItem>
        <NavbarItem >
          {/* <LanguageSwitcher /> */}
          <GoogleTranslate />
        </NavbarItem>
        {user.isLoggedIn && (
          <Dropdown
            placement="bottom-end"
            className={` z-50 ${isDarkMode && "yellow-bright"} text-foreground bg-background `}
            classNames={{
              content: "border-small border-divider bg-background",
            }}
          >
            <DropdownTrigger>
              <Avatar
                showFallback
                isBordered
                as="button"
                className="transition-transform"
                color="primary"

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
        )}
      </NavbarContent>
    </Navbar>
  );
}

export default NewNavBar;
