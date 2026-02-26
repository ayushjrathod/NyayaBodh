import { Input, Textarea } from "@nextui-org/react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const PrincipalDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Principal Details</h3>
    <InputField
      label="Name"
      name="principal_name"
      value={formData.principal_name}
      onChange={handleChange}
      placeholder="Enter principal name"
    />
    <InputField
      label="Age"
      name="principal_age"
      value={formData.principal_age}
      onChange={handleChange}
      placeholder="Enter principal age"
    />
    <Textarea
      label="Address"
      name="principal_address"
      value={formData.principal_address}
      onChange={handleChange}
      placeholder="Enter principal address"
      className="mb-4"
    />
  </div>
);

const AttorneyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Attorney Details</h3>
    <InputField
      label="Name"
      name="attorney_name"
      value={formData.attorney_name}
      onChange={handleChange}
      placeholder="Enter attorney name"
    />
    <InputField
      label="Age"
      name="attorney_age"
      value={formData.attorney_age}
      onChange={handleChange}
      placeholder="Enter attorney age"
    />
    <Textarea
      label="Address"
      name="attorney_address"
      value={formData.attorney_address}
      onChange={handleChange}
      placeholder="Enter attorney address"
      className="mb-4"
    />
  </div>
);

const PowerDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Power Details</h3>
    <Textarea
      label="Powers Granted"
      name="powers_granted"
      value={formData.powers_granted}
      onChange={handleChange}
      placeholder="Enter powers being granted"
      className="mb-4"
    />
    <InputField
      label="Duration"
      name="duration"
      value={formData.duration}
      onChange={handleChange}
      placeholder="Enter duration of power of attorney"
    />
  </div>
);

const WitnessDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Witness Details</h3>
    <InputField
      label="Witness 1 Name"
      name="witness_1_name"
      value={formData.witness_1_name}
      onChange={handleChange}
      placeholder="Enter witness 1 name"
    />
    <InputField
      label="Witness 2 Name"
      name="witness_2_name"
      value={formData.witness_2_name}
      onChange={handleChange}
      placeholder="Enter witness 2 name"
    />
  </div>
);

const FormSections = {
  PrincipalDetails,
  AttorneyDetails,
  PowerDetails,
  WitnessDetails,
};

export default FormSections;
