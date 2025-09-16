import { useState } from "react";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import MultiStepForm from "../../ui/organisms/MultiStepForm";
import FormSections from "./FormSections";

/**
 * AgreementOfSaleForm component — a five-step multi-section form to generate an Agreement of Sale PDF.
 *
 * Renders a multi-step UI for collecting seller, purchaser, property, sale, and previous ownership details.
 * Validates that all fields are filled before submitting; on submit it POSTs the collected form data as JSON
 * to https://whale-legal-api.onrender.com/generate_agreement_of_sale_pdf. On a successful response the returned
 * PDF blob is opened in a new browser tab and a success banner is shown; on failure an error message is displayed.
 *
 * Note: this component uses a multi-step form hook for navigation and submission state and delegates per-step
 * inputs to components from FormSections. It has the side effect of performing a network request and opening a new tab.
 *
 * @returns {JSX.Element} The Agreement of Sale multi-step form UI.
 */
function AgreementOfSaleForm() {
  const initialFormData = {
    seller_name: "",
    seller_father_name: "",
    seller_age: "",
    seller_address: "",
    seller_wife: "",
    seller_sons_daughters: "",
    purchaser_name: "",
    purchaser_father_name: "",
    purchaser_age: "",
    purchaser_address: "",
    schedule_property: "",
    sale_amount: "",
    advance_amount: "",
    cheque_no: "",
    bank_name: "",
    cheque_date: "",
    balance_amount: "",
    transaction_end_date: "",
    purpose_of_sale: "",
    previous_owner: "",
    previous_sale_deed_date: "",
    previous_sale_doct_no: "",
    previous_sale_book1_volumne_no: "",
    previous_sale_page_no_start: "",
    prev_sale_page_no_end: "",
    witness_1: "",
    witness_2: "",
  };

  const {
    currentStep,
    formData,
    progress,
    isFirstStep,
    isLastStep,
    isSubmitting,
    updateField,
    nextStep,
    prevStep,
    setIsSubmitting,
  } = useMultiStepForm(initialFormData, 5);

  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
    if (errorMsg) setErrorMsg(""); // Clear error when user starts typing
  };

  const handleSubmit = async () => {
    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== "");

    if (!allFieldsFilled) {
      setErrorMsg("Please fill in all fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("https://whale-legal-api.onrender.com/generate_agreement_of_sale_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        
        // Open PDF in new tab
        window.open(pdfUrl, '_blank');
        
        setSuccess(true);
        setErrorMsg("");
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      } else {
        setErrorMsg("Failed to submit the form. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMsg("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      title: "Property Details",
      component: <FormSections.PropertyDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Sale Details",
      component: <FormSections.SaleDetails formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Previous Ownership Details",
      component: <FormSections.PreviousOwnershipDetails formData={formData} handleChange={handleChange} />,
    },
  ];

  return (
    <MultiStepForm
      title="Agreement of Sale Form"
      steps={formSections}
      currentStep={currentStep}
      progress={progress}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      onNext={nextStep}
      onPrev={prevStep}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {formSections[currentStep].component}
      
      {errorMsg && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p className="text-danger text-sm">{errorMsg}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-success text-sm">Form submitted successfully! PDF opened in new tab.</p>
        </div>
      )}
    </MultiStepForm>
  );
}

export default AgreementOfSaleForm;