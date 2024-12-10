import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Book, Download, Filter, Search } from "lucide-react";
import { useSelector } from "react-redux";

// Mock data for demonstration
const mockLaws = [
  {
    id: 1,
    title: "Criminal Code",
    description: "Comprehensive legislation covering criminal offenses and procedures.",
    type: "code",
    content: "Long text content about the Criminal Code...",
    pdfUrl: "/criminal-code.pdf",
  },
  {
    id: 2,
    title: "Civil Procedure Rules",
    description: "Rules governing civil litigation processes.",
    type: "rules",
    content: "Detailed content about Civil Procedure Rules...",
    pdfUrl: null,
  },
  {
    id: 3,
    title: "Environmental Protection Act",
    description: "Legislation for environmental conservation and sustainable development.",
    type: "act",
    content: "In-depth content about the Environmental Protection Act...",
    pdfUrl: "/environmental-act.pdf",
  },
  // Add more mock laws here...
];

const LawLookupPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const filteredLaws = mockLaws.filter(
    (law) =>
      law.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedFilter === "all" || law.type === selectedFilter)
  );

  const openLawDetails = (law) => {
    setSelectedLaw(law);
    onOpen();
  };

  return (
    <div className="min-h-screen font-inter container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Law Lookup</h1>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search for laws, acts, or codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="text-default-400" />}
          className="flex-grow"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="flat" startContent={<Filter className="text-default-400" />}>
              {selectedFilter === "all" ? "All Types" : selectedFilter}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Filter laws" onAction={(key) => setSelectedFilter(key)}>
            <DropdownItem key="all">All Types</DropdownItem>
            <DropdownItem key="code">Codes</DropdownItem>
            <DropdownItem key="act">Acts</DropdownItem>
            <DropdownItem key="rules">Rules</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredLaws.map((law) => (
          <Card
            key={law.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            isPressable
            onPress={() => openLawDetails(law)}
          >
            <h3 className="text-lg font-semibold mb-2">{law.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{law.description}</p>
            <Chip color="primary" variant="flat">
              {law.type}
            </Chip>
          </Card>
        ))}
      </div>

      <Accordion>
        <AccordionItem key="1" aria-label="Legal Resources" title="Legal Resources">
          <ul className="list-disc pl-5">
            <li>Law Libraries</li>
            <li>Legal Databases</li>
            <li>Court Websites</li>
            <li>Government Legal Portals</li>
          </ul>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Recent Updates" title="Recent Legal Updates">
          <ul className="list-disc pl-5">
            <li>Amendment to Labor Laws (June 2023)</li>
            <li>New Cybersecurity Regulations (May 2023)</li>
            <li>Supreme Court Ruling on Privacy Rights (April 2023)</li>
          </ul>
        </AccordionItem>
        <AccordionItem key="3" aria-label="FAQ" title="Frequently Asked Questions">
          <ul className="list-disc pl-5">
            <li>How to cite legal sources?</li>
            <li>What's the difference between a law and a regulation?</li>
            <li>How to interpret legal jargon?</li>
          </ul>
        </AccordionItem>
      </Accordion>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        className={` ${isDarkMode && "dark"} bg-background text-foreground`}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">{selectedLaw?.title}</h2>
              </ModalHeader>
              <ModalBody>
                {selectedLaw?.pdfUrl ? (
                  <div>
                    <p className="mb-4">{selectedLaw.description}</p>
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedLaw.pdfUrl)}&embedded=true`}
                      width="100%"
                      height="500px"
                      title={selectedLaw.title}
                    ></iframe>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4">{selectedLaw?.description}</p>
                    <p>{selectedLaw?.content}</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" startContent={<Book />}>
                  Add to Reading List
                </Button>
                {selectedLaw?.pdfUrl && (
                  <Button color="primary" href={selectedLaw.pdfUrl} download startContent={<Download />}>
                    Download PDF
                  </Button>
                )}
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LawLookupPage;
