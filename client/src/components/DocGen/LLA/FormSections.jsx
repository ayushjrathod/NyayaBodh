// FormSectionsLLA.jsx
import { Input, Textarea } from "@nextui-org/react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const GeneralDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">General Details</h3>
    <InputField label="Date" name="date" value={formData.date} onChange={handleChange} placeholder="Enter date" />
    <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
    <InputField
      label="Stamp Duty"
      name="stamp_duty"
      value={formData.stamp_duty}
      onChange={handleChange}
      placeholder="Enter stamp duty"
    />
    <InputField
      label="Stamp Duty GRN"
      name="stamp_duty_grn"
      value={formData.stamp_duty_grn}
      onChange={handleChange}
      placeholder="Enter stamp duty GRN"
    />
    <InputField
      label="Stamp Duty Date"
      name="stamp_duty_date"
      value={formData.stamp_duty_date}
      onChange={handleChange}
      placeholder="Enter stamp duty date"
    />
    <InputField
      label="Registration Fee"
      name="registration_fee"
      value={formData.registration_fee}
      onChange={handleChange}
      placeholder="Enter registration fee"
    />
    <InputField
      label="Registration GRN"
      name="registration_grn"
      value={formData.registration_grn}
      onChange={handleChange}
      placeholder="Enter registration GRN"
    />
    <InputField
      label="Registration Date"
      name="registration_date"
      value={formData.registration_date}
      onChange={handleChange}
      placeholder="Enter registration date"
    />
  </div>
);

const LicensorDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Licensor Details</h3>
    <InputField
      label="Name"
      name="licensor_name"
      value={formData.licensor_name}
      onChange={handleChange}
      placeholder="Enter licensor name"
    />
    <InputField
      label="Age"
      name="licensor_age"
      value={formData.licensor_age}
      onChange={handleChange}
      placeholder="Enter licensor age"
    />
    <InputField
      label="Occupation"
      name="licensor_occupation"
      value={formData.licensor_occupation}
      onChange={handleChange}
      placeholder="Enter licensor occupation"
    />
    <InputField
      label="PAN"
      name="licensor_pan"
      value={formData.licensor_pan}
      onChange={handleChange}
      placeholder="Enter licensor PAN"
    />
    <InputField
      label="UID"
      name="licensor_uid"
      value={formData.licensor_uid}
      onChange={handleChange}
      placeholder="Enter licensor UID"
    />
    <Textarea
      label="Address"
      name="licensor_address"
      value={formData.licensor_address}
      onChange={handleChange}
      placeholder="Enter licensor address"
      className="mb-4"
    />
  </div>
);

const LicenseeDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Licensee Details</h3>
    <InputField
      label="Name"
      name="licensee_name"
      value={formData.licensee_name}
      onChange={handleChange}
      placeholder="Enter licensee name"
    />
    <InputField
      label="Age"
      name="licensee_age"
      value={formData.licensee_age}
      onChange={handleChange}
      placeholder="Enter licensee age"
    />
    <InputField
      label="Occupation"
      name="licensee_occupation"
      value={formData.licensee_occupation}
      onChange={handleChange}
      placeholder="Enter licensee occupation"
    />
    <InputField
      label="PAN"
      name="licensee_pan"
      value={formData.licensee_pan}
      onChange={handleChange}
      placeholder="Enter licensee PAN"
    />
    <InputField
      label="UID"
      name="licensee_uid"
      value={formData.licensee_uid}
      onChange={handleChange}
      placeholder="Enter licensee UID"
    />
    <Textarea
      label="Address"
      name="licensee_address"
      value={formData.licensee_address}
      onChange={handleChange}
      placeholder="Enter licensee address"
      className="mb-4"
    />
  </div>
);

const LeaseDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Lease Details</h3>
    <InputField
      label="Period (Months)"
      name="period"
      value={formData.period}
      onChange={handleChange}
      placeholder="Enter lease period"
    />
    <InputField
      label="Start Date"
      name="start_date"
      value={formData.start_date}
      onChange={handleChange}
      placeholder="Enter start date"
    />
    <InputField
      label="End Date"
      name="end_date"
      value={formData.end_date}
      onChange={handleChange}
      placeholder="Enter end date"
    />
    <InputField
      label="Monthly Rent"
      name="monthly_rent"
      value={formData.monthly_rent}
      onChange={handleChange}
      placeholder="Enter monthly rent"
    />
    <InputField
      label="Deposit"
      name="deposit"
      value={formData.deposit}
      onChange={handleChange}
      placeholder="Enter deposit amount"
    />
    <InputField
      label="Deposit Payment Method"
      name="deposit_payment_method"
      value={formData.deposit_payment_method}
      onChange={handleChange}
      placeholder="Enter deposit payment method"
    />
    <InputField
      label="Maintenance Charges Paid By"
      name="maintenance_charges_paid_by"
      value={formData.maintenance_charges_paid_by}
      onChange={handleChange}
      placeholder="Enter who pays maintenance charges"
    />
    <InputField
      label="Purpose"
      name="purpose"
      value={formData.purpose}
      onChange={handleChange}
      placeholder="Enter purpose"
    />
  </div>
);

const PropertyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
    <InputField
      label="Flat Number"
      name="flat_number"
      value={formData.flat_number}
      onChange={handleChange}
      placeholder="Enter flat number"
    />
    <InputField
      label="Built Up Area"
      name="built_up_area"
      value={formData.built_up_area}
      onChange={handleChange}
      placeholder="Enter built-up area"
    />
    <InputField
      label="Floor"
      name="floor"
      value={formData.floor}
      onChange={handleChange}
      placeholder="Enter floor number"
    />
    <InputField
      label="Building Name"
      name="building_name"
      value={formData.building_name}
      onChange={handleChange}
      placeholder="Enter building name"
    />
    <Textarea
      label="Plot Details"
      name="plot_details"
      value={formData.plot_details}
      onChange={handleChange}
      placeholder="Enter plot details"
      className="mb-4"
    />
    <InputField
      label="Village"
      name="village"
      value={formData.village}
      onChange={handleChange}
      placeholder="Enter village"
    />
    <InputField
      label="Tehsil"
      name="tehsil"
      value={formData.tehsil}
      onChange={handleChange}
      placeholder="Enter tehsil"
    />
    <InputField
      label="District"
      name="district"
      value={formData.district}
      onChange={handleChange}
      placeholder="Enter district"
    />
    <InputField
      label="Municipal Corporation"
      name="municipal_corporation"
      value={formData.municipal_corporation}
      onChange={handleChange}
      placeholder="Enter municipal corporation"
    />
  </div>
);

const FormSections = {
  GeneralDetails,
  LicensorDetails,
  LicenseeDetails,
  LeaseDetails,
  PropertyDetails,
};

export default FormSections;
