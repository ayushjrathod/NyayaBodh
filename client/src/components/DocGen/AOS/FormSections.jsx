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
      placeholder="Enter seller's age"
    />
    <InputField
      label="Address"
      name="seller_address"
      value={formData.seller_address}
      onChange={handleChange}
      placeholder="Enter seller's address"
    />
    <InputField
      label="Wife's Name"
      name="seller_wife"
      value={formData.seller_wife}
      onChange={handleChange}
      placeholder="Enter wife's name"
    />
    <InputField
      label="Sons/Daughters"
      name="seller_sons_daughters"
      value={formData.seller_sons_daughters}
      onChange={handleChange}
      placeholder="Enter sons/daughters' names"
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
      placeholder="Enter purchaser's age"
    />
    <InputField
      label="Address"
      name="purchaser_address"
      value={formData.purchaser_address}
      onChange={handleChange}
      placeholder="Enter purchaser's address"
    />
  </div>
);

const PropertyDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
    <Textarea
      label="Schedule Property"
      name="schedule_property"
      value={formData.schedule_property}
      onChange={handleChange}
      placeholder="Describe the property details"
      className="mb-4"
    />
  </div>
);

const SaleDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
    <InputField
      label="Sale Amount"
      name="sale_amount"
      value={formData.sale_amount}
      onChange={handleChange}
      placeholder="Enter sale amount"
    />
    <InputField
      label="Advance Amount"
      name="advance_amount"
      value={formData.advance_amount}
      onChange={handleChange}
      placeholder="Enter advance amount"
    />
    <InputField
      label="Cheque No"
      name="cheque_no"
      value={formData.cheque_no}
      onChange={handleChange}
      placeholder="Enter cheque number"
    />
    <InputField
      label="Bank Name"
      name="bank_name"
      value={formData.bank_name}
      onChange={handleChange}
      placeholder="Enter bank name"
    />
    <InputField
      label="Cheque Date"
      name="cheque_date"
      value={formData.cheque_date}
      onChange={handleChange}
      placeholder="Enter cheque date"
    />
    <InputField
      label="Balance Amount"
      name="balance_amount"
      value={formData.balance_amount}
      onChange={handleChange}
      placeholder="Enter balance amount"
    />
    <InputField
      label="Transaction End Date"
      name="transaction_end_date"
      value={formData.transaction_end_date}
      onChange={handleChange}
      placeholder="Enter transaction end date"
    />
    <InputField
      label="Purpose of Sale"
      name="purpose_of_sale"
      value={formData.purpose_of_sale}
      onChange={handleChange}
      placeholder="Enter purpose of sale"
    />
    <InputField
      label="Witness 1"
      name="witness_1"
      value={formData.witness_1}
      onChange={handleChange}
      placeholder="Enter witness 1"
    />
    <InputField
      label="Witness 2"
      name="witness_2"
      value={formData.witness_2}
      onChange={handleChange}
      placeholder="Enter witness 2"
    />
  </div>
);

const PreviousOwnershipDetails = ({ formData, handleChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Previous Ownership Details</h3>
    <InputField
      label="Previous Owner"
      name="previous_owner"
      value={formData.previous_owner}
      onChange={handleChange}
      placeholder="Enter previous owner"
    />
    <InputField
      label="Previous Sale Deed Date"
      name="previous_sale_deed_date"
      value={formData.previous_sale_deed_date}
      onChange={handleChange}
      placeholder="Enter previous sale deed date"
    />
    <InputField
      label="Previous Sale Doc No"
      name="previous_sale_doct_no"
      value={formData.previous_sale_doct_no}
      onChange={handleChange}
      placeholder="Enter document no"
    />
    <InputField
      label="Previous Sale Book 1 Volume No"
      name="previous_sale_book1_volumne_no"
      value={formData.previous_sale_book1_volumne_no}
      onChange={handleChange}
      placeholder="Enter volume number"
    />
    <InputField
      label="Previous Sale Page No (Start)"
      name="previous_sale_page_no_start"
      value={formData.previous_sale_page_no_start}
      onChange={handleChange}
      placeholder="Enter start page number"
    />
    <InputField
      label="Previous Sale Page No (End)"
      name="prev_sale_page_no_end"
      value={formData.prev_sale_page_no_end}
      onChange={handleChange}
      placeholder="Enter end page number"
    />
  </div>
);

const FormSections = {
  SellerDetails,
  PurchaserDetails,
  PropertyDetails,
  SaleDetails,
  PreviousOwnershipDetails,
};

export default FormSections;
