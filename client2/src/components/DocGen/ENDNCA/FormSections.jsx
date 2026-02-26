import { Input, Textarea } from "@nextui-org/react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const CompanyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Company Details</h3>
    <InputField
      label="Company Name"
      name="company_name"
      value={formData.company_name}
      onChange={handleChange}
      placeholder="Enter company name"
    />
    <Textarea
      label="Company Address"
      name="company_address"
      value={formData.company_address}
      onChange={handleChange}
      placeholder="Enter company address"
      className="mb-4"
    />
  </div>
);

const EmployeeDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Employee Details</h3>
    <InputField
      label="Employee Name"
      name="employee_name"
      value={formData.employee_name}
      onChange={handleChange}
      placeholder="Enter employee name"
    />
    <Textarea
      label="Employee Address"
      name="employee_address"
      value={formData.employee_address}
      onChange={handleChange}
      placeholder="Enter employee address"
      className="mb-4"
    />
  </div>
);

const AgreementDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Agreement Details</h3>
    <InputField
      label="High Court City"
      name="high_court_city"
      value={formData.high_court_city}
      onChange={handleChange}
      placeholder="Enter high court city"
    />
  </div>
);

const FormSections = {
  CompanyDetails,
  EmployeeDetails,
  AgreementDetails,
};

export default FormSections;
