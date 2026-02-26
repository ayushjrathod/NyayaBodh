import { Button, Card, CardBody, CardHeader, Modal, Progress } from "@nextui-org/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import FormSections from "./FormSections";

function WillDeedForm() {
  const [formData, setFormData] = useState({
    file_name: "will_deed.pdf",
    testator_name: "",
    father_name: "",
    testator_address: "",
    testator_age: "",
    religion: "",
    occupation: "",
    wife_name: "",
    children_details: "",
    family_members: "",
    property_details: "",
    executors: [
      {
        name: "",
        father_name: "",
        address: "",
        age: "",
        religion: "",
        occupation: "",
      },
    ],
    witness_1_name: "",
    witness_1_address: "",
    witness_2_name: "",
    witness_2_address: "",
    day_of_contract: "",
    month_of_contract: "",
    year_of_contract: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExecutorChange = (index, field, value) => {
    const updatedExecutors = [...formData.executors];
    updatedExecutors[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      executors: updatedExecutors,
    }));
  };

  const addExecutor = () => {
    setFormData((prev) => ({
      ...prev,
      executors: [...prev.executors, { name: "", father_name: "", address: "", age: "", religion: "", occupation: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (key === "executors") {
        return value.every((executor) => Object.values(executor).every((field) => field.trim() !== ""));
      }
      return typeof value === "string" ? value.trim() !== "" : true;
    });

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
          setErrorMsg("Failed to submit the form. Please try again.");
        }
      } catch (error) {
        setErrorMsg("An error occurred. Please try again later.");
      }
    } else {
      setErrorMsg("Please fill in all required fields.");
    }
  };

  const formSections = [
    {
      title: "Testator Details",
      component: <FormSections.TestatorDetailsSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Family Details",
      component: <FormSections.FamilyDetailsSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Property Details",
      component: <FormSections.PropertySection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Executors",
      component: (
        <FormSections.ExecutorsSection
          formData={formData}
          handleChange={handleChange}
          handleExecutorChange={handleExecutorChange}
          addExecutor={addExecutor}
        />
      ),
    },
    {
      title: "Witnesses",
      component: <FormSections.WitnessesSection formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Contract Date",
      component: <FormSections.ContractDateSection formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Will Deed Form</h2>
          <Progress value={(currentStep / (formSections.length - 1)) * 100} className="max-w-md" color="primary" />
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            {formSections[currentStep].component}
            {errorMsg && <p className="text-red-500 text-center mt-4">{errorMsg}</p>}
            <div className="flex justify-between mt-6">
              <Button
                auto
                color="default"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                <ChevronLeft className="mr-2" />
                Previous
              </Button>
              {currentStep === formSections.length - 1 ? (
                <Button auto color="success" type="submit">
                  <Check className="mr-2" />
                  Submit
                </Button>
              ) : (
                <Button auto color="primary" onClick={() => setCurrentStep((prev) => prev + 1)}>
                  Next
                  <ChevronRight className="ml-2" />
                </Button>
              )}
            </div>
            {success && <p className="text-green-500 text-center mt-4">Form submitted successfully!</p>}
          </form>
        </CardBody>
      </Card>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
          URL.revokeObjectURL(pdfUrl);
          setPdfUrl(null);
        }}
      >
        <Modal.Header>
          <h3 className="text-lg font-semibold">PDF Preview</h3>
        </Modal.Header>
        <Modal.Body>{pdfUrl && <iframe src={pdfUrl} width="100%" height="600px" title="PDF Preview" />}</Modal.Body>
        <Modal.Footer>
          <Button auto color="error" onClick={() => setModalIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default WillDeedForm;
