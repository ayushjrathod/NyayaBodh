import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections";

/**
 * Multi-step React form component for creating a Leave and License Agreement and previewing a generated PDF.
 *
 * Renders a five-step wizard (General Details, Licensor, Licensee, Lease, Property) that collects all agreement
 * fields in a single `formData` state object, validates that every field is filled, and submits the data to an
 * external PDF generation endpoint. On successful submission the component creates an object URL from the returned
 * PDF blob, opens a modal to preview the PDF in an iframe, and retains a success indicator; closing the modal revokes
 * the created object URL to free resources.
 *
 * Side effects:
 * - Performs a POST request with `formData` to https://whale-legal-api.onrender.com/generate-lnl-pdf.
 * - Creates and stores a blob object URL for the generated PDF on success.
 * - Revokes the object URL when the preview modal is closed.
 *
 * @returns {JSX.Element} The LicenseAgreementForm component UI.
 */
function LicenseAgreementForm() {
  const [formData, setFormData] = useState({
    date: "",
    city: "",
    stamp_duty: "",
    stamp_duty_grn: "",
    stamp_duty_date: "",
    registration_fee: "",
    registration_grn: "",
    registration_date: "",
    licensor_name: "",
    licensor_age: "",
    licensor_occupation: "",
    licensor_pan: "",
    licensor_uid: "",
    licensor_address: "",
    licensee_name: "",
    licensee_age: "",
    licensee_occupation: "",
    licensee_pan: "",
    licensee_uid: "",
    licensee_address: "",
    period: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit: "",
    deposit_payment_method: "",
    maintenance_charges_paid_by: "",
    purpose: "",
    flat_number: "",
    built_up_area: "",
    floor: "",
    building_name: "",
    plot_details: "",
    village: "",
    tehsil: "",
    district: "",
    municipal_corporation: "",
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
        const response = await fetch("https://whale-legal-api.onrender.com/generate-lnl-pdf", {
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
      title: "General Details",
      component: <FormSections.GeneralDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Licensor Details",
      component: <FormSections.LicensorDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Licensee Details",
      component: <FormSections.LicenseeDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Lease Details",
      component: <FormSections.LeaseDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Property Details",
      component: <FormSections.PropertyDetails formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Leave and License Agreement Form</h2>
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
      </Modal>
    </div>
  );
}

export default LicenseAgreementForm;
