import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../../store/slices/languageSlice";
import { getDropdownThemeClasses } from "../../utils/themeUtils";

/**
 * Language selection component that renders a themed dropdown and updates the app language in Redux.
 *
 * Reads the current language and dark-mode flag from the Redux store, renders a NextUI Dropdown whose
 * trigger shows the active language label, and dispatches `setLanguage` with the chosen key when selection changes.
 *
 * @return {JSX.Element} A Dropdown UI allowing selection between "en" (English) and "hi" (हिंदी).
 */
function LanguageSwitcher() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.language);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleChange = (key) => {
    dispatch(setLanguage(key.currentKey));
  };

  return (
    <Dropdown
      className={getDropdownThemeClasses(isDarkMode)}
      classNames={{
        content: "border-small border-divider bg-background",
      }}
    >
      <DropdownTrigger>
        <Button color="primary" variant="flat">
          {language === "en" ? "English" : "हिंदी"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        selectedKeys={language}
        variant="solid"
        onSelectionChange={(key) => handleChange(key)}
      >
        <DropdownItem key="en">English</DropdownItem>
        <DropdownItem key="hi">हिंदी</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default LanguageSwitcher;
