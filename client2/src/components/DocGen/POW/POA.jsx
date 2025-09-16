import React from "react";
import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections";

/**
 * Multi-step Power of Attorney form component that collects principal, attorney, power, and witness details,
 * posts the completed data to a backend to generate a PDF, and shows a PDF preview in a modal.
 *
 * The component manages form state across four steps, validates that all fields are filled before submission,
 * sends a POST request to "https://whale-legal-api.onrender.com/generate-pow-pdf", converts a successful
 * response blob into an object URL for preview, and revokes that URL when the preview modal is closed.
 *
 * Renders navigation (Previous/Next) between sections and a Submit button on the final step. Displays
 * inline error and success messages based on validation and submission outcome.
 *
 * @returns {JSX.Element} The POA form UI.
 */
function POA() {
  const [formData, setFormData] = useState({
    principal_name: "",
    principal_age: "",
    principal_address: "",
    attorney_name: "",
    attorney_age: "",
    attorney_address: "",
    powers_granted: "",
    duration: "",
    witness_1_name: "",
    witness_2_name: "",
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
        const response = await fetch("https://whale-legal-api.onrender.com/generate-pow-pdf", {
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
      title: "Principal Details",
      component: <FormSections.PrincipalDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Attorney Details",
      component: <FormSections.AttorneyDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Power Details",
      component: <FormSections.PowerDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Witness Details",
      component: <FormSections.WitnessDetails formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Power of Attorney Form</h2>
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

export default POA;
