import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../store/slices/languageSlice';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, SelectItem, Select } from '@nextui-org/react';

function LanguageSwitcher() {
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.language);
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);


    const handleChange = (key) => {
        dispatch(setLanguage(key.currentKey));
    };

    return (

        <Dropdown className={` z-50 ${isDarkMode && "yellow-bright"} text-foreground bg-background `}
            classNames={{
                content: "border-small border-divider bg-background",
            }}>
            <DropdownTrigger>
                <Button color='primary' variant="flat">
                    {language === 'en' ? "English" : "हिंदी"}
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

