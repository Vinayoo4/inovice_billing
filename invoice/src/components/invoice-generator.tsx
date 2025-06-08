import React from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Select, 
  SelectItem, 
  Textarea, 
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Autocomplete,
  AutocompleteItem,
  Tooltip,
  Switch,
  DatePicker
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";
import { InvoicePreview } from "./invoice-preview";
import { customers, taxRates, paymentTerms } from "../data/invoice-data";
import { parseDate } from "@internationalized/date";
import { sampleInvoiceItems } from "../data/invoice-data";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax?: number;
  discount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customer: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  items: InvoiceItem[];
  notes: string;
  terms: string;
  taxRate: number;
  status: "draft" | "pending" | "paid";
  discount: number;
  discountType: "percentage" | "fixed";
  currency: string;
  recurring: boolean;
  recurringPeriod?: string;
  paymentMethod?: string;
  companyLogo?: string;
  companyInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    taxId: string;
  };
}

export const InvoiceGenerator: React.FC = () => {
  const [invoice, setInvoice] = React.useState<Invoice>({
    id: uuidv4(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: {
      id: "",
      name: "",
      email: "",
      address: ""
    },
    items: [
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        price: 0,
        discount: 0
      }
    ],
    notes: "",
    terms: "Payment is due within 30 days from the date of invoice. Thank you for your business.",
    taxRate: 0,
    status: "draft",
    discount: 0,
    discountType: "percentage",
    currency: "USD",
    recurring: false,
    companyInfo: {
      name: "Your Company Name",
      address: "123 Business Street\nCity, State 12345",
      email: "contact@yourcompany.com",
      phone: "+1 (555) 123-4567",
      website: "www.yourcompany.com",
      taxId: "TAX-ID-12345"
    }
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = React.useState<string>("");

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const [itemSuggestions, setItemSuggestions] = React.useState(sampleInvoiceItems);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setInvoice(prev => ({
        ...prev,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          address: customer.address
        }
      }));
    }
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: uuidv4(),
          description: "",
          quantity: 1,
          price: 0,
          discount: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length === 1) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const handleTaxRateChange = (rate: string) => {
    setInvoice(prev => ({
      ...prev,
      taxRate: parseFloat(rate)
    }));
  };

  const handlePaymentTermsChange = (terms: string) => {
    // Calculate new due date based on payment terms
    const daysToAdd = parseInt(terms.split(' ')[0]);
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + daysToAdd);
    
    setInvoice(prev => ({
      ...prev,
      dueDate: newDueDate.toISOString().split('T')[0],
      terms: `Payment is due within ${terms} from the date of invoice. Thank you for your business.`
    }));
  };

  const handleDiscountChange = (value: string, type: "percentage" | "fixed") => {
    setInvoice(prev => ({
      ...prev,
      discount: parseFloat(value) || 0,
      discountType: type
    }));
  };

  const handleRecurringToggle = (isSelected: boolean) => {
    setInvoice(prev => ({
      ...prev,
      recurring: isSelected
    }));
  };

  const handleRecurringPeriodChange = (period: string) => {
    setInvoice(prev => ({
      ...prev,
      recurringPeriod: period
    }));
  };

  const handleCurrencyChange = (currency: string) => {
    setInvoice(prev => ({
      ...prev,
      currency
    }));
  };

  const handleCompanyInfoChange = (field: keyof Invoice['companyInfo'], value: string) => {
    setInvoice(prev => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value
      }
    }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (invoice.discountType === "percentage") {
      return subtotal * (invoice.discount / 100);
    }
    return invoice.discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * (invoice.taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handleSaveInvoice = (status: "draft" | "pending" | "paid" = "draft") => {
    const finalInvoice = {
      ...invoice,
      status
    };
    
    // Save to localStorage
    const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    localStorage.setItem("invoices", JSON.stringify([...savedInvoices, finalInvoice]));
    
    // Reset form or show success message
    alert(`Invoice ${status === "draft" ? "saved as draft" : "created successfully"}!`);
    
    // Reset form to create a new invoice
    setInvoice({
      id: uuidv4(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: {
        id: "",
        name: "",
        email: "",
        address: ""
      },
      items: [
        {
          id: uuidv4(),
          description: "",
          quantity: 1,
          price: 0,
          discount: 0
        }
      ],
      notes: "",
      terms: "Payment is due within 30 days from the date of invoice. Thank you for your business.",
      taxRate: 0,
      status: "draft",
      discount: 0,
      discountType: "percentage",
      currency: "USD",
      recurring: false,
      companyInfo: {
        name: "Your Company Name",
        address: "123 Business Street\nCity, State 12345",
        email: "contact@yourcompany.com",
        phone: "+1 (555) 123-4567",
        website: "www.yourcompany.com",
        taxId: "TAX-ID-12345"
      }
    });
    setSelectedCustomer("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const currencies = [
    { label: "USD - US Dollar", value: "USD", symbol: "$" },
    { label: "EUR - Euro", value: "EUR", symbol: "€" },
    { label: "GBP - British Pound", value: "GBP", symbol: "£" },
    { label: "JPY - Japanese Yen", value: "JPY", symbol: "¥" },
    { label: "CAD - Canadian Dollar", value: "CAD", symbol: "C$" },
    { label: "AUD - Australian Dollar", value: "AUD", symbol: "A$" },
    { label: "INR - Indian Rupee", value: "INR", symbol: "₹" },
    { label: "CNY - Chinese Yuan", value: "CNY", symbol: "¥" },
  ];

  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.value === invoice.currency);
    return curr?.symbol || "$";
  };

  const handleItemSuggestionSelect = (id: string, description: string) => {
    const item = sampleInvoiceItems.find(item => item.description === description);
    if (item) {
      handleItemChange(id, "description", description);
      handleItemChange(id, "price", item.price);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Invoice Number"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
              <DatePicker
                label="Invoice Date"
                defaultValue={parseDate(invoice.date)}
                onChange={(date) => {
                  if (date) {
                    setInvoice(prev => ({ 
                      ...prev, 
                      date: date.toString().split('T')[0]
                    }));
                  }
                }}
              />
              <DatePicker
                label="Due Date"
                defaultValue={parseDate(invoice.dueDate)}
                onChange={(date) => {
                  if (date) {
                    setInvoice(prev => ({ 
                      ...prev, 
                      dueDate: date.toString().split('T')[0]
                    }));
                  }
                }}
              />
              <Select
                label="Payment Terms"
                placeholder="Select payment terms"
                onChange={(e) => handlePaymentTermsChange(e.target.value)}
              >
                {paymentTerms.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Currency"
                placeholder="Select currency"
                defaultSelectedKeys={[invoice.currency]}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex items-center gap-2 h-full">
                <Switch 
                  isSelected={invoice.recurring}
                  onValueChange={handleRecurringToggle}
                >
                  Recurring Invoice
                </Switch>
                {invoice.recurring && (
                  <Select
                    placeholder="Period"
                    className="w-24 ml-2"
                    onChange={(e) => handleRecurringPeriodChange(e.target.value)}
                  >
                    <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                    <SelectItem key="quarterly" value="quarterly">Quarterly</SelectItem>
                    <SelectItem key="yearly" value="yearly">Yearly</SelectItem>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="flex gap-2 mb-4">
              <Select
                label="Select Customer"
                placeholder="Choose a customer"
                className="flex-1"
                selectedKeys={selectedCustomer ? [selectedCustomer] : []}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </Select>
              <Button 
                color="primary" 
                className="self-end"
                isIconOnly
                variant="flat"
              >
                <Icon icon="lucide:user-plus" width={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Customer Name"
                value={invoice.customer.name}
                onChange={(e) => setInvoice(prev => ({ 
                  ...prev, 
                  customer: { ...prev.customer, name: e.target.value } 
                }))}
              />
              <Input
                label="Customer Email"
                type="email"
                value={invoice.customer.email}
                onChange={(e) => setInvoice(prev => ({ 
                  ...prev, 
                  customer: { ...prev.customer, email: e.target.value } 
                }))}
              />
              <Textarea
                label="Customer Address"
                value={invoice.customer.address}
                onChange={(e) => setInvoice(prev => ({ 
                  ...prev, 
                  customer: { ...prev.customer, address: e.target.value } 
                }))}
              />
            </div>
          </div>

          <div>
            <Button 
              variant="flat" 
              color="default" 
              endContent={showAdvancedOptions ? <Icon icon="lucide:chevron-up" width={16} /> : <Icon icon="lucide:chevron-down" width={16} />}
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="mb-4"
            >
              {showAdvancedOptions ? "Hide" : "Show"} Company Information
            </Button>
            
            {showAdvancedOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-divider rounded-lg">
                <Input
                  label="Company Name"
                  value={invoice.companyInfo.name}
                  onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                />
                <Input
                  label="Company Email"
                  value={invoice.companyInfo.email}
                  onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                />
                <Input
                  label="Company Phone"
                  value={invoice.companyInfo.phone}
                  onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                />
                <Input
                  label="Company Website"
                  value={invoice.companyInfo.website}
                  onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                />
                <Input
                  label="Tax ID / VAT Number"
                  value={invoice.companyInfo.taxId}
                  onChange={(e) => handleCompanyInfoChange("taxId", e.target.value)}
                />
                <Textarea
                  label="Company Address"
                  value={invoice.companyInfo.address}
                  onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                  className="md:col-span-2"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Invoice Items</h2>
            <Button 
              color="primary" 
              variant="flat" 
              startContent={<Icon icon="lucide:plus" width={16} />}
              onPress={handleAddItem}
            >
              Add Item
            </Button>
          </div>
          
          <Card>
            <CardBody className="p-0">
              <Table removeWrapper aria-label="Invoice items table">
                <TableHeader>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>QTY</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>TOTAL</TableColumn>
                  <TableColumn></TableColumn>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Autocomplete
                          placeholder="Item description"
                          defaultItems={sampleInvoiceItems}
                          variant="underlined"
                          size="sm"
                          defaultInputValue={item.description}
                          onSelectionChange={(key) => {
                            if (typeof key === 'string') {
                              const selectedItem = sampleInvoiceItems.find(i => i.description === key);
                              if (selectedItem) {
                                handleItemChange(item.id, "description", selectedItem.description);
                                handleItemChange(item.id, "price", selectedItem.price);
                              }
                            }
                          }}
                          onInputChange={(value) => handleItemChange(item.id, "description", value)}
                        >
                          {(item) => (
                            <AutocompleteItem key={item.description} textValue={item.description}>
                              <div className="flex justify-between">
                                <span>{item.description}</span>
                                <span className="text-foreground-500">{formatCurrency(item.price)}</span>
                              </div>
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity.toString()}
                          onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)}
                          variant="underlined"
                          size="sm"
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price.toString()}
                          onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)}
                          variant="underlined"
                          size="sm"
                          className="w-24"
                          startContent={
                            <div className="pointer-events-none flex items-center">
                              <span className="text-default-400 text-small">{getCurrencySymbol()}</span>
                            </div>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.quantity * item.price)}
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveItem(item.id)}
                          isDisabled={invoice.items.length === 1}
                        >
                          <Icon icon="lucide:trash-2" width={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-4 w-full md:w-1/2">
                <Select
                  label="Tax Rate"
                  placeholder="Select tax rate"
                  className="w-full"
                  onChange={(e) => handleTaxRateChange(e.target.value)}
                >
                  {taxRates.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value.toString()}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <div className="flex gap-2 items-end">
                  <Input
                    type="number"
                    label="Discount"
                    min="0"
                    value={invoice.discount.toString()}
                    onChange={(e) => handleDiscountChange(e.target.value, invoice.discountType)}
                    className="flex-1"
                  />
                  <Select
                    aria-label="Discount Type"
                    defaultSelectedKeys={[invoice.discountType]}
                    onChange={(e) => handleDiscountChange(invoice.discount.toString(), e.target.value as "percentage" | "fixed")}
                    className="w-32"
                  >
                    <SelectItem key="percentage" value="percentage">%</SelectItem>
                    <SelectItem key="fixed" value="fixed">{getCurrencySymbol()}</SelectItem>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 text-right w-full md:w-1/2">
                <div className="flex justify-between gap-8">
                  <span className="text-foreground-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between gap-8">
                    <span className="text-foreground-500">
                      Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : ""}:
                    </span>
                    <span className="font-medium text-danger">-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between gap-8">
                  <span className="text-foreground-500">Tax ({invoice.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(calculateTax())}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between gap-8 text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Textarea
              label="Notes"
              placeholder="Add any notes for the customer"
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-divider">
        <Tooltip content="Save your work and finish later">
          <Button
            variant="flat"
            color="default"
            onPress={() => handleSaveInvoice("draft")}
          >
            Save as Draft
          </Button>
        </Tooltip>
        <Tooltip content="Preview before sending">
          <Button
            color="primary"
            variant="flat"
            onPress={onOpen}
            startContent={<Icon icon="lucide:eye" width={16} />}
          >
            Preview Invoice
          </Button>
        </Tooltip>
        <Tooltip content="Create invoice and send to customer">
          <Button
            color="primary"
            onPress={() => handleSaveInvoice("pending")}
            startContent={<Icon icon="lucide:send" width={16} />}
          >
            Create & Send
          </Button>
        </Tooltip>
      </div>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Invoice Preview
              </ModalHeader>
              <ModalBody>
                <InvoicePreview invoice={invoice} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    handleSaveInvoice("pending");
                    onClose();
                  }}
                >
                  Create Invoice
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};