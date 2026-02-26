import { Input } from "@nextui-org/react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const OwnerDetailsSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Owner Details</h3>
    <InputField
      label="Owner Name"
      name="owner_name"
      value={formData.owner_name}
      onChange={handleChange}
      placeholder="Enter owner name"
    />
    <InputField
      label="Owner Address"
      name="owner_address"
      value={formData.owner_address}
      onChange={handleChange}
      placeholder="Enter owner address"
    />
    <InputField
      label="Owner Age"
      name="owner_age"
      value={formData.owner_age}
      onChange={handleChange}
      placeholder="Enter owner age"
    />
  </div>
);

const WitnessesDetailsSection = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Witnesses' Details</h3>
    <InputField
      label="Witness 1 Name"
      name="witness_1_name"
      value={formData.witness_1_name}
      onChange={handleChange}
      placeholder="Enter witness 1 name"
    />
    <InputField
      label="Witness 1 Address"
      name="witness_1_address"
      value={formData.witness_1_address}
      onChange={handleChange}
      placeholder="Enter witness 1 address"
    />
    <InputField
      label="Witness 2 Name"
      name="witness_2_name"
      value={formData.witness_2_name}
      onChange={handleChange}
      placeholder="Enter witness 2 name"
    />
    <InputField
      label="Witness 2 Address"
      name="witness_2_address"
      value={formData.witness_2_address}
      onChange={handleChange}
      placeholder="Enter witness 2 address"
    />
  </div>
);

const PropertyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
    <InputField
      label="Property Type"
      name="property_type"
      value={formData.property_type}
      onChange={handleChange}
      placeholder="Enter property type (e.g., Flat, Apartment)"
    />
    <InputField
      label="Property Address"
      name="property_address"
      value={formData.property_address}
      onChange={handleChange}
      placeholder="Enter property address"
    />
    <InputField
      label="Property Size"
      name="property_size"
      value={formData.property_size}
      onChange={handleChange}
      placeholder="Enter property size"
    />
  </div>
);

const SaleDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
    <InputField
      label="Sale Price"
      name="sale_price"
      value={formData.sale_price}
      onChange={handleChange}
      placeholder="Enter sale price"
    />
    <InputField
      label="Payment Method"
      name="payment_method"
      value={formData.payment_method}
      onChange={handleChange}
      placeholder="Enter payment method"
    />
    <InputField
      label="Sale Date"
      name="sale_date"
      value={formData.sale_date}
      onChange={handleChange}
      placeholder="Enter sale date"
    />
  </div>
);

const FormSections = {
  OwnerDetailsSection,
  WitnessesDetailsSection,
  PropertyDetails,
  SaleDetails,
};

export default FormSections;
