import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Input, Textarea, Select, SelectItem } from "@nextui-org/react"
import { useSelector } from "react-redux"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.string().min(1, {
    message: "Please select your role.",
  }),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})


export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const contactform = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      // const response = await createMessage(values)
      let response = false;
      function createMessage() {
        setTimeout(() => {
          response = true
        }, 2000);
      }
      createMessage()

      if (response) {
        // toast({
        //   title: "Message sent!",
        //   description: "We'll get back to you as soon as possible.",
        // })
        contactform.reset()
      }
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "There was a problem sending your message. Please try again.",
      //   variant: "destructive",
      // })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative  px-4 py-16 bg-background">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div
        className={`absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full ${isDarkMode
          ? "bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"
          : "bg-[radial-gradient(circle_400px_at_50%_300px,#d5c5ff,#ffffff80)]"
          } `}
      ></div>
      <div className=" relative z-10 ">

        <h1
          className={`font-Poppins bg-clip-text text-transparent text-center bg-gradient-to-b ${isDarkMode ? "from-neutral-100 to-neutral-500" : "from-black to-neutral-500"
            } text-2xl md:text-4xl lg:text-7xl py-2 md:py-10 font-semibold tracking-tight`}
        >
          Contact Support
        </h1>


        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lg text-center mb-8">
            We're here to help! If you're experiencing any issues with our legal research platform
            or have any questions, please don't hesitate to reach out to our support team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center">
              <Mail className="h-6 w-6 mr-4 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>support@legalresearch.com</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-6 w-6 mr-4 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-4 text-primary" />
              <div>
                <h3 className="font-semibold">Support Hours</h3>
                <p>Mon-Fri: 9am - 5pm</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-6 w-6 mr-4 text-primary" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>123 Legal Plaza, Justice City, JC 12345</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-24">
          <div className="grid grid-cols-[1.1fr_1.2fr] space-x-4">
            <Card className="max-w-full h-fit p-4">
              <CardHeader className="font-semibold text-2xl">Send us a message</CardHeader>
              <CardBody className="overflow-hidden">
                <form onSubmit={contactform.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Name"
                    isInvalid={!!contactform.formState.errors.name}
                    errorMessage={contactform.formState.errors.name?.message}
                    placeholder="Enter your name"
                    {...contactform.register("name")}
                  />
                  <Input
                    isRequired
                    label="Email"
                    isInvalid={!!contactform.formState.errors.email}
                    errorMessage={contactform.formState.errors.email?.message}
                    placeholder="Enter your email"
                    {...contactform.register("email")}
                  />
                  <Select
                    isRequired
                    label="Role"
                    placeholder="Select your role"
                    isInvalid={!!contactform.formState.errors.role}
                    errorMessage={contactform.formState.errors.role?.message}
                    {...contactform.register("role")}
                    classNames={{
                      value: "text-small text-white",
                      popoverContent: ` ${isDarkMode && "dark"} bg-background text-foreground`,
                    }}
                  >
                    <SelectItem key="lawyer" value="lawyer">Lawyer</SelectItem>
                    <SelectItem key="judge" value="judge">Judge</SelectItem>
                    <SelectItem key="clerk" value="clerk">Clerk</SelectItem>
                    <SelectItem key="other" value="other">Other</SelectItem>
                  </Select>
                  <Input
                    label="Subject"
                    isInvalid={!!contactform.formState.errors.subject}
                    errorMessage={contactform.formState.errors.subject?.message}
                    placeholder="Enter your subject"
                    {...contactform.register("subject")}
                  />
                  <Textarea
                    isRequired
                    label="Message"
                    isInvalid={!!contactform.formState.errors.message}
                    errorMessage={contactform.formState.errors.message?.message}
                    placeholder="Describe your issue or question"
                    {...contactform.register("message")}
                  />
                  <Button color='primary' type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardBody>
            </Card>
            <div className="font-Cormorant text-4xl flex items-center justify-center font-semibold text-primary">
              Having trouble with our platform<br /> or need assistance?<br /> We're here to help!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

