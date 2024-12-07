import { Input, Textarea } from "@nextui-org/react";
import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <Input label={label} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mb-4" />
);

const SellerDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Seller Details</h3>
    <InputField
      label="Name"
      name="seller_name"
      value={formData.seller_name}
      onChange={handleChange}
      placeholder="Enter seller name"
    />
    <InputField
      label="Father's Name"
      name="seller_father_name"
      value={formData.seller_father_name}
      onChange={handleChange}
      placeholder="Enter father's name"
    />
    <InputField
      label="Age"
      name="seller_age"
      value={formData.seller_age}
      onChange={handleChange}
      placeholder="Enter age"
    />
    <InputField
      label="PAN"
      name="seller_pan"
      value={formData.seller_pan}
      onChange={handleChange}
      placeholder="Enter PAN number"
    />
    <InputField
      label="Address"
      name="seller_address"
      value={formData.seller_address}
      onChange={handleChange}
      placeholder="Enter complete address"
    />
  </div>
);

const PurchaserDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Purchaser Details</h3>
    <InputField
      label="Name"
      name="purchaser_name"
      value={formData.purchaser_name}
      onChange={handleChange}
      placeholder="Enter purchaser name"
    />
    <InputField
      label="Father's Name"
      name="purchaser_father_name"
      value={formData.purchaser_father_name}
      onChange={handleChange}
      placeholder="Enter father's name"
    />
    <InputField
      label="Age"
      name="purchaser_age"
      value={formData.purchaser_age}
      onChange={handleChange}
      placeholder="Enter age"
    />
    <InputField
      label="PAN"
      name="purchaser_pan"
      value={formData.purchaser_pan}
      onChange={handleChange}
      placeholder="Enter PAN number"
    />
    <InputField
      label="Address"
      name="purchaser_address"
      value={formData.purchaser_address}
      onChange={handleChange}
      placeholder="Enter complete address"
    />
  </div>
);

const LandDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Land Details</h3>
    <InputField
      label="Size"
      name="land_details.size"
      value={formData.land_details.size}
      onChange={handleChange}
      placeholder="Enter land size"
    />
    <InputField
      label="Location"
      name="land_details.location"
      value={formData.land_details.location}
      onChange={handleChange}
      placeholder="Enter land location"
    />
    <h4 className="text-lg font-medium mb-2 mt-4">Boundaries</h4>
    <InputField
      label="North"
      name="land_details.boundaries.north"
      value={formData.land_details.boundaries.north}
      onChange={handleChange}
      placeholder="North boundary"
    />
    <InputField
      label="South"
      name="land_details.boundaries.south"
      value={formData.land_details.boundaries.south}
      onChange={handleChange}
      placeholder="South boundary"
    />
    <InputField
      label="East"
      name="land_details.boundaries.east"
      value={formData.land_details.boundaries.east}
      onChange={handleChange}
      placeholder="East boundary"
    />
    <InputField
      label="West"
      name="land_details.boundaries.west"
      value={formData.land_details.boundaries.west}
      onChange={handleChange}
      placeholder="West boundary"
    />
  </div>
);

const SaleDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
    <InputField
      label="Total Consideration"
      name="total_consideration"
      value={formData.total_consideration}
      onChange={handleChange}
      placeholder="Enter total amount"
    />
    <Textarea
      label="Cheque Details"
      name="cheque_details"
      value={formData.cheque_details}
      onChange={handleChange}
      placeholder="Enter complete cheque details"
      className="mb-4"
    />
    <InputField
      label="Witness 1"
      name="witness_1"
      value={formData.witness_1}
      onChange={handleChange}
      placeholder="Enter first witness name"
    />
    <InputField
      label="Witness 2"
      name="witness_2"
      value={formData.witness_2}
      onChange={handleChange}
      placeholder="Enter second witness name"
    />
  </div>
);

const FormSections = {
  SellerDetails,
  PurchaserDetails,
  LandDetails,
  SaleDetails,
};

export default FormSections;
