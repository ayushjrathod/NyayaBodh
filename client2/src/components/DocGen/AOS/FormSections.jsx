import FormField from "../../ui/molecules/FormField";

const SellerDetails = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">Seller Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Seller Name"
        name="seller_name"
        value={formData.seller_name}
        onChange={handleChange}
        placeholder="Enter seller name"
        isRequired
      />
      <FormField
        label="Father's Name"
        name="seller_father_name"
        value={formData.seller_father_name}
        onChange={handleChange}
        placeholder="Enter father's name"
        isRequired
      />
      <FormField
        label="Age"
        name="seller_age"
        type="number"
        value={formData.seller_age}
        onChange={handleChange}
        placeholder="Enter seller's age"
        isRequired
      />
      <FormField
        label="Wife's Name"
        name="seller_wife"
        value={formData.seller_wife}
        onChange={handleChange}
        placeholder="Enter wife's name"
      />
    </div>
    <FormField
      type="textarea"
      label="Address"
      name="seller_address"
      value={formData.seller_address}
      onChange={handleChange}
      placeholder="Enter seller's address"
      isRequired
    />
    <FormField
      label="Sons/Daughters"
      name="seller_sons_daughters"
      value={formData.seller_sons_daughters}
      onChange={handleChange}
      placeholder="Enter sons/daughters' names"
    />
  </div>
);

const PurchaserDetails = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">Purchaser Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Purchaser Name"
        name="purchaser_name"
        value={formData.purchaser_name}
        onChange={handleChange}
        placeholder="Enter purchaser name"
        isRequired
      />
      <FormField
        label="Father's Name"
        name="purchaser_father_name"
        value={formData.purchaser_father_name}
        onChange={handleChange}
        placeholder="Enter father's name"
        isRequired
      />
      <FormField
        label="Age"
        name="purchaser_age"
        type="number"
        value={formData.purchaser_age}
        onChange={handleChange}
        placeholder="Enter purchaser's age"
        isRequired
      />
    </div>
    <FormField
      type="textarea"
      label="Address"
      name="purchaser_address"
      value={formData.purchaser_address}
      onChange={handleChange}
      placeholder="Enter purchaser's address"
      isRequired
    />
  </div>
);

const PropertyDetails = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">Property Details</h3>
    <FormField
      type="textarea"
      label="Schedule Property"
      name="schedule_property"
      value={formData.schedule_property}
      onChange={handleChange}
      placeholder="Describe the property details"
      isRequired
      minRows={4}
    />
  </div>
);

const SaleDetails = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">Sale Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Sale Amount"
        name="sale_amount"
        type="number"
        value={formData.sale_amount}
        onChange={handleChange}
        placeholder="Enter sale amount"
        isRequired
      />
      <FormField
        label="Advance Amount"
        name="advance_amount"
        type="number"
        value={formData.advance_amount}
        onChange={handleChange}
        placeholder="Enter advance amount"
        isRequired
      />
      <FormField
        label="Cheque Number"
        name="cheque_no"
        value={formData.cheque_no}
        onChange={handleChange}
        placeholder="Enter cheque number"
        isRequired
      />
      <FormField
        label="Bank Name"
        name="bank_name"
        value={formData.bank_name}
        onChange={handleChange}
        placeholder="Enter bank name"
        isRequired
      />
      <FormField
        label="Cheque Date"
        name="cheque_date"
        type="date"
        value={formData.cheque_date}
        onChange={handleChange}
        isRequired
      />
      <FormField
        label="Balance Amount"
        name="balance_amount"
        type="number"
        value={formData.balance_amount}
        onChange={handleChange}
        placeholder="Enter balance amount"
        isRequired
      />
      <FormField
        label="Transaction End Date"
        name="transaction_end_date"
        type="date"
        value={formData.transaction_end_date}
        onChange={handleChange}
        isRequired
      />
    </div>
    <FormField
      type="textarea"
      label="Purpose of Sale"
      name="purpose_of_sale"
      value={formData.purpose_of_sale}
      onChange={handleChange}
      placeholder="Enter purpose of sale"
      isRequired
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Witness 1"
        name="witness_1"
        value={formData.witness_1}
        onChange={handleChange}
        placeholder="Enter witness 1 name"
        isRequired
      />
      <FormField
        label="Witness 2"
        name="witness_2"
        value={formData.witness_2}
        onChange={handleChange}
        placeholder="Enter witness 2 name"
        isRequired
      />
    </div>
  </div>
);

const PreviousOwnershipDetails = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">Previous Ownership Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Previous Owner"
        name="previous_owner"
        value={formData.previous_owner}
        onChange={handleChange}
        placeholder="Enter previous owner name"
        isRequired
      />
      <FormField
        label="Previous Sale Deed Date"
        name="previous_sale_deed_date"
        type="date"
        value={formData.previous_sale_deed_date}
        onChange={handleChange}
        isRequired
      />
      <FormField
        label="Previous Sale Document Number"
        name="previous_sale_doct_no"
        value={formData.previous_sale_doct_no}
        onChange={handleChange}
        placeholder="Enter document number"
        isRequired
      />
      <FormField
        label="Previous Sale Book 1 Volume Number"
        name="previous_sale_book1_volumne_no"
        value={formData.previous_sale_book1_volumne_no}
        onChange={handleChange}
        placeholder="Enter volume number"
        isRequired
      />
      <FormField
        label="Previous Sale Page Number (Start)"
        name="previous_sale_page_no_start"
        type="number"
        value={formData.previous_sale_page_no_start}
        onChange={handleChange}
        placeholder="Enter start page number"
        isRequired
      />
      <FormField
        label="Previous Sale Page Number (End)"
        name="prev_sale_page_no_end"
        type="number"
        value={formData.prev_sale_page_no_end}
        onChange={handleChange}
        placeholder="Enter end page number"
        isRequired
      />
    </div>
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