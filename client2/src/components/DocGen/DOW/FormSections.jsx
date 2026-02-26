// WillDeedFormSections.jsx
import { Button, Input, Textarea } from "@nextui-org/react";
import { Plus } from "lucide-react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <Textarea label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const TestatorDetailsSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Testator Details</h3>
    <InputField
      label="Testator Name"
      name="testator_name"
      value={formData.testator_name}
      onChange={handleChange}
      placeholder="Enter testator's name"
    />
    <InputField
      label="Father's Name"
      name="father_name"
      value={formData.father_name}
      onChange={handleChange}
      placeholder="Enter father's name"
    />
    <TextAreaField
      label="Address"
      name="testator_address"
      value={formData.testator_address}
      onChange={handleChange}
      placeholder="Enter address"
    />
    <InputField
      label="Age"
      name="testator_age"
      value={formData.testator_age}
      onChange={handleChange}
      placeholder="Enter age"
    />
    <InputField
      label="Religion"
      name="religion"
      value={formData.religion}
      onChange={handleChange}
      placeholder="Enter religion"
    />
    <InputField
      label="Occupation"
      name="occupation"
      value={formData.occupation}
      onChange={handleChange}
      placeholder="Enter occupation"
    />
  </div>
);

const FamilyDetailsSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Family Details</h3>
    <InputField
      label="Wife's Name"
      name="wife_name"
      value={formData.wife_name}
      onChange={handleChange}
      placeholder="Enter wife's name"
    />
    <TextAreaField
      label="Children Details"
      name="children_details"
      value={formData.children_details}
      onChange={handleChange}
      placeholder="Enter children details"
    />
    <TextAreaField
      label="Family Members"
      name="family_members"
      value={formData.family_members}
      onChange={handleChange}
      placeholder="Enter family members details"
    />
  </div>
);

const PropertySection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
    <TextAreaField
      label="Property Details"
      name="property_details"
      value={formData.property_details}
      onChange={handleChange}
      placeholder="Enter property details"
    />
  </div>
);

const ExecutorsSection = ({ formData, handleExecutorChange, addExecutor }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Executors</h3>
    {formData.executors.map((executor, index) => (
      <div key={index} className="mb-6 p-4 border rounded">
        <h4 className="font-medium mb-3">Executor {index + 1}</h4>
        <InputField
          label="Name"
          value={executor.name}
          onChange={(e) => handleExecutorChange(index, "name", e.target.value)}
          placeholder="Enter executor's name"
        />
        <InputField
          label="Father's Name"
          value={executor.father_name}
          onChange={(e) => handleExecutorChange(index, "father_name", e.target.value)}
          placeholder="Enter father's name"
        />
        <TextAreaField
          label="Address"
          value={executor.address}
          onChange={(e) => handleExecutorChange(index, "address", e.target.value)}
          placeholder="Enter address"
        />
        <InputField
          label="Age"
          value={executor.age}
          onChange={(e) => handleExecutorChange(index, "age", e.target.value)}
          placeholder="Enter age"
        />
        <InputField
          label="Religion"
          value={executor.religion}
          onChange={(e) => handleExecutorChange(index, "religion", e.target.value)}
          placeholder="Enter religion"
        />
        <InputField
          label="Occupation"
          value={executor.occupation}
          onChange={(e) => handleExecutorChange(index, "occupation", e.target.value)}
          placeholder="Enter occupation"
        />
      </div>
    ))}
    <Button auto color="secondary" onClick={addExecutor} className="mt-2">
      <Plus className="mr-2" />
      Add Executor
    </Button>
  </div>
);

const WitnessesSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Witnesses</h3>
    <InputField
      label="Witness 1 Name"
      name="witness_1_name"
      value={formData.witness_1_name}
      onChange={handleChange}
      placeholder="Enter first witness name"
    />
    <TextAreaField
      label="Witness 1 Address"
      name="witness_1_address"
      value={formData.witness_1_address}
      onChange={handleChange}
      placeholder="Enter first witness address"
    />
    <InputField
      label="Witness 2 Name"
      name="witness_2_name"
      value={formData.witness_2_name}
      onChange={handleChange}
      placeholder="Enter second witness name"
    />
    <TextAreaField
      label="Witness 2 Address"
      name="witness_2_address"
      value={formData.witness_2_address}
      onChange={handleChange}
      placeholder="Enter second witness address"
    />
  </div>
);

const ContractDateSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Contract Date</h3>
    <InputField
      label="Day"
      name="day_of_contract"
      value={formData.day_of_contract}
      onChange={handleChange}
      placeholder="Enter day"
    />
    <InputField
      label="Month"
      name="month_of_contract"
      value={formData.month_of_contract}
      onChange={handleChange}
      placeholder="Enter month"
    />
    <InputField
      label="Year"
      name="year_of_contract"
      value={formData.year_of_contract}
      onChange={handleChange}
      placeholder="Enter year"
    />
  </div>
);

const FormSections = {
  TestatorDetailsSection,
  FamilyDetailsSection,
  PropertySection,
  ExecutorsSection,
  WitnessesSection, // Add this
  ContractDateSection, // Add this
};

export default FormSections;
