import { Input, Textarea } from "@nextui-org/react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const EffectiveDateSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Effective Date</h3>
    <InputField
      label="Effective Date"
      name="effective_date"
      value={formData.effective_date}
      onChange={handleChange}
      placeholder="Enter effective date"
    />
  </div>
);

const PartyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Party Details</h3>
    <InputField
      label="Party 1 Name"
      name="party1_name"
      value={formData.party1_name}
      onChange={handleChange}
      placeholder="Enter Party 1 name"
    />
    <InputField
      label="Party 2 Name"
      name="party2_name"
      value={formData.party2_name}
      onChange={handleChange}
      placeholder="Enter Party 2 name"
    />
    <InputField
      label="Party 1 Business"
      name="party1_business"
      value={formData.party1_business}
      onChange={handleChange}
      placeholder="Enter Party 1 business"
    />
    <InputField
      label="Party 2 Business"
      name="party2_business"
      value={formData.party2_business}
      onChange={handleChange}
      placeholder="Enter Party 2 business"
    />
  </div>
);

const PurposeSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Purpose</h3>
    <Textarea
      label="Purpose"
      name="purpose"
      value={formData.purpose}
      onChange={handleChange}
      placeholder="Enter purpose"
      className="mb-4"
    />
  </div>
);

const ConfidentialitySection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Confidentiality</h3>
    <InputField
      label="Confidentiality Period (Years)"
      name="confidentiality_period"
      value={formData.confidentiality_period}
      onChange={handleChange}
      placeholder="Enter confidentiality period"
    />
    <InputField
      label="Jurisdiction"
      name="jurisdiction"
      value={formData.jurisdiction}
      onChange={handleChange}
      placeholder="Enter jurisdiction"
    />
  </div>
);

const FormSections = {
  EffectiveDateSection,
  PartyDetails,
  PurposeSection,
  ConfidentialitySection,
};

export default FormSections;
