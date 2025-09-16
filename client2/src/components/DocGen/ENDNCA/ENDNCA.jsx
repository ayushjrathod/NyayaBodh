import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections";

/**
 * EmployeeNDAForm React component — a three-step form for generating an Employee NDA PDF.
 *
 * Renders a multi-step UI collecting company, employee, and agreement details, validates that all fields
 * are filled, and on submission POSTs the form data to an API to generate a PDF. On successful response
 * the component creates an object URL for the returned PDF blob, opens a preview modal showing the PDF,
 * and revokes the object URL when the modal is closed.
 *
 * Notes:
 * - Validation: requires all form fields (company_name, company_address, employee_name, employee_address, high_court_city) to be non-empty.
 * - API endpoint used for PDF generation: POST https://whale-legal-api.onrender.com/generate_employee_nda_pdf
 * - Side effects: performs a network request, creates and revokes a blob object URL, and manages modal visibility.
 *
 * @returns {JSX.Element} The Employee NDA form UI.
 */
function EmployeeNDAForm() {
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    employee_name: "",
    employee_address: "",
    high_court_city: "",
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
        const response = await fetch("https://whale-legal-api.onrender.com/generate_employee_nda_pdf", {
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
      title: "Company Details",
      component: <FormSections.CompanyDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Employee Details",
      component: <FormSections.EmployeeDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Agreement Details",
      component: <FormSections.AgreementDetails formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Employee NDA Form</h2>
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

export default EmployeeNDAForm;
