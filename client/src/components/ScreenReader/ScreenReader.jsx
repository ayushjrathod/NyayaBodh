
import React, { useState, useEffect, useCallback } from 'react'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react'
import { PauseIcon, CircleStop, Volume2, Speech } from 'lucide-react'
import { useSelector } from 'react-redux'

const ScreenReader = () => {
    const [isPaused, setIsPaused] = useState(false)
    const [utterance, setUtterance] = useState(null)
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);


    const handlePlay = useCallback(() => {
        const synth = window.speechSynthesis
        if (isPaused) {
            synth.resume()
        } else {
            const content = document.body.innerText
            const newUtterance = new SpeechSynthesisUtterance(content)
            setUtterance(newUtterance)
            synth.speak(newUtterance)
        }
        setIsPaused(false)
    }, [isPaused])

    const handlePause = useCallback(() => {
        const synth = window.speechSynthesis
        synth.pause()
        setIsPaused(true)
    }, [])

    const handleStop = useCallback(() => {
        const synth = window.speechSynthesis
        synth.cancel()
        setIsPaused(false)
    }, [])

    useEffect(() => {
        return () => {
            const synth = window.speechSynthesis
            synth.cancel()
        }
    }, [])

    return (
        <Dropdown
            placement="bottom-end"
            className={` z-50 ${isDarkMode && "yellow-bright"} text-foreground bg-background `}
            classNames={{
                content: "border-small border-divider bg-background",
            }}
        >
            <DropdownTrigger >
                <Button isIconOnly aria-label="Speech" variant="flat" color="primary" >

                    <Speech />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="signinas" className="h-14 gap-2 cursor-default">
                    <div className="flex space-x-2">
                        <Button onClick={handlePlay} radius='full' aria-label="Start reading">
                            <Volume2 className={`h-4 w-4 `} />
                        </Button>
                        <Button onClick={handlePause} radius='full' aria-label="Pause reading">
                            <PauseIcon className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleStop} radius='full' aria-label="Stop reading">
                            <CircleStop className="h-4 w-4" />
                        </Button>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>

    )
}

export default ScreenReader

