import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections";

/**
 * Renders a multi-step Deed of Sale form for a flat, validates input, submits the collected data
 * to an API to generate a PDF, and previews the generated PDF in a modal.
 *
 * Manages form state for owner, witnesses, property, and sale details across four steps, shows
 * progress and navigation controls, displays validation and server error messages, and revokes
 * the created object URL when the preview modal is closed.
 *
 * @returns {JSX.Element} The Deed of Sale form UI with PDF generation and preview behavior.
 */
function DeedOfSaleOfFlat() {
  const [formData, setFormData] = useState({
    owner_name: "",
    owner_address: "",
    owner_age: "",
    witness_1_name: "",
    witness_1_address: "",
    witness_2_name: "",
    witness_2_address: "",
    property_type: "",
    property_address: "",
    property_size: "",
    sale_price: "",
    payment_method: "",
    sale_date: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== "");

    if (allFieldsFilled) {
      try {
        const response = await fetch("https://whale-legal-api.onrender.com/generate_will_deed_pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const blob = await response.blob();
          const pdfUrl = URL.createObjectURL(blob);
          setPdfUrl(pdfUrl);
          setModalIsOpen(true);
          setSuccess(true);
          setErrorMsg("");
        } else {
          setErrorMsg("Failed to generate the PDF. Please try again.");
        }
      } catch (error) {
        setErrorMsg("An error occurred while generating the PDF. Please try again.");
      }
    } else {
      setErrorMsg("Please fill in all fields before submitting.");
      setSuccess(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const formSections = [
    {
      title: "Owner Details",
      component: <FormSections.OwnerDetailsSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Witnesses Details",
      component: <FormSections.WitnessesDetailsSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Property Details",
      component: <FormSections.PropertyDetails formData={formData} handleChange={handleChange} />,
    },
    { title: "Sale Details", component: <FormSections.SaleDetails formData={formData} handleChange={handleChange} /> },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Deed of Sale Form</h2>
          <Progress value={(currentStep / (formSections.length - 1)) * 100} className="max-w-md" color="primary" />
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            {formSections[currentStep].component}
            {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}
            <div className="flex justify-between mt-4">
              <Button auto color="default" disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
                <ChevronLeft className="mr-2" />
                Previous
              </Button>
              {currentStep === formSections.length - 1 ? (
                <Button auto color="success" type="submit">
                  <Check className="mr-2" />
                  Generate PDF
                </Button>
              ) : (
                <Button auto color="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                  <ChevronRight className="ml-2" />
                </Button>
              )}
            </div>
            {success && <p className="text-green-500 text-center mt-4">PDF generated successfully!</p>}
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <Modal.Header>
          <h3 className="text-lg font-semibold">PDF Preview</h3>
        </Modal.Header>
        <Modal.Body>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="600px" title="PDF Preview"></iframe>}
        </Modal.Body>
        <Modal.Footer>
          <Button auto color="error" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DeedOfSaleOfFlat;
