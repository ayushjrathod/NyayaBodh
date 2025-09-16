import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections";

/**
 * Multi-step NDA form component that collects agreement details, validates input, submits the data to an API to generate a PDF, and previews the resulting PDF in a modal.
 *
 * The form tracks its own state for fields (effective date, party names and businesses, purpose, confidentiality period, jurisdiction), the current step, submission success/failure messages, and the generated PDF URL. Navigation between four steps is provided with a progress indicator; the last step submits the form. On successful submission the component converts the API response to a Blob URL and opens a modal containing an iframe preview of the PDF; closing the modal revokes the object URL.
 *
 * Validation: all fields are required and must be non-empty (trimmed) before submission.
 *
 * Side effects: posts JSON to https://whale-legal-api.onrender.com/generate-general-nda-pdf and creates/revokes an object URL for the returned PDF blob.
 *
 * @returns {JSX.Element} The rendered NDA form and PDF preview modal.
 */
function NDAForm() {
  const [formData, setFormData] = useState({
    effective_date: "",
    party1_name: "",
    party2_name: "",
    party1_business: "",
    party2_business: "",
    purpose: "",
    confidentiality_period: "",
    jurisdiction: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== "");

    if (allFieldsFilled) {
      try {
        const response = await fetch("https://whale-legal-api.onrender.com/generate-general-nda-pdf", {
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
          setErrorMsg("Failed to submit the form. Please try again.");
        }
      } catch (error) {
        setErrorMsg("An error occurred while submitting the form. Please try again.");
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
      title: "Effective Date",
      component: <FormSections.EffectiveDateSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Party Details",
      component: <FormSections.PartyDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Purpose",
      component: <FormSections.PurposeSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Confidentiality",
      component: <FormSections.ConfidentialitySection formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Non-Disclosure Agreement</h2>
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
                  Submit
                </Button>
              ) : (
                <Button auto color="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                  <ChevronRight className="ml-2" />
                </Button>
              )}
            </div>
            {success && <p className="text-green-500 text-center mt-4">Form submitted successfully!</p>}
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

export default NDAForm;
