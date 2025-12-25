import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import FormSections from "./FormSections"; // Updated import

function LandSaleDeedForm() {
  const [formData, setFormData] = useState({
    seller_name: "",
    seller_father_name: "",
    seller_age: "",
    seller_pan: "",
    seller_address: "",
    purchaser_name: "",
    purchaser_father_name: "",
    purchaser_age: "",
    purchaser_pan: "",
    purchaser_address: "",
    land_details: {
      size: "",
      location: "",
      boundaries: {
        north: "",
        south: "",
        east: "",
        west: "",
      },
    },
    total_consideration: "",
    cheque_details: "",
    witness_1: "",
    witness_2: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      if (name.includes(".")) {
        const [parentKey, childKey, grandchildKey] = name.split(".");
        return {
          ...prevState,
          [parentKey]: {
            ...prevState[parentKey],
            [childKey]: grandchildKey ? { ...prevState[parentKey][childKey], [grandchildKey]: value } : value,
          },
        };
      }
      return { ...prevState, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFieldsFilled = Object.values(formData).every((field) => {
      if (typeof field === "object") {
        return Object.values(field).every((subField) => {
          if (typeof subField === "object") {
            return Object.values(subField).every((value) => value.trim() !== "");
          }
          return subField.trim() !== "";
        });
      }
      return field.trim() !== "";
    });

    if (allFieldsFilled) {
      try {
        const response = await fetch("https://whale-legal-api.onrender.com/generate_land_sale_deed_pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          setErrorMsg("Failed to generate PDF. Please try again.");
        }
      } catch (error) {
        setErrorMsg("An error occurred. Please try again.");
      }
    } else {
      setErrorMsg("Please fill in all fields.");
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
      title: "Seller Details",
      component: <FormSections.SellerDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Purchaser Details",
      component: <FormSections.PurchaserDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Land Details",
      component: <FormSections.LandDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Sale Details",
      component: <FormSections.SaleDetails formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Land Sale Deed Form</h2>
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

export default LandSaleDeedForm;
