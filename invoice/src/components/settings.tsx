import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Textarea, 
  Button, 
  Divider, 
  Switch,
  Tabs,
  Tab,
  Select,
  SelectItem
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  logo?: string;
}

interface InvoiceSettings {
  defaultTaxRate: number;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  defaultNotes: string;
  defaultTerms: string;
  invoiceNumberPrefix: string;
  invoiceNumberSuffix: string;
  invoiceNumberDigits: number;
  nextInvoiceNumber: number;
}

interface EmailSettings {
  emailTemplate: string;
  emailSubject: string;
  emailSignature: string;
  ccEmails: string;
  bccEmails: string;
}

export const Settings: React.FC = () => {
  const [companyInfo, setCompanyInfo] = React.useState<CompanyInfo>({
    name: "Your Company Name",
    address: "123 Business Street\nCity, State 12345",
    email: "contact@yourcompany.com",
    phone: "+1 (555) 123-4567",
    website: "www.yourcompany.com",
    taxId: "TAX-ID-12345"
  });

  const [invoiceSettings, setInvoiceSettings] = React.useState<InvoiceSettings>({
    defaultTaxRate: 0,
    defaultCurrency: "USD",
    defaultPaymentTerms: "30 days",
    defaultNotes: "",
    defaultTerms: "Payment is due within 30 days from the date of invoice. Thank you for your business.",
    invoiceNumberPrefix: "INV-",
    invoiceNumberSuffix: "",
    invoiceNumberDigits: 4,
    nextInvoiceNumber: 1001
  });

  const [emailSettings, setEmailSettings] = React.useState<EmailSettings>({
    emailTemplate: "Dear {customer},\n\nPlease find attached invoice #{invoiceNumber} for {amount}.\n\nDue date: {dueDate}\n\nThank you for your business.",
    emailSubject: "Invoice #{invoiceNumber} from {company}",
    emailSignature: "Best regards,\n{company} Team",
    ccEmails: "",
    bccEmails: ""
  });

  React.useEffect(() => {
    // Load settings from localStorage
    const savedCompanyInfo = localStorage.getItem("companyInfo");
    const savedInvoiceSettings = localStorage.getItem("invoiceSettings");
    const savedEmailSettings = localStorage.getItem("emailSettings");
    
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo));
    }
    
    if (savedInvoiceSettings) {
      setInvoiceSettings(JSON.parse(savedInvoiceSettings));
    }
    
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
  }, []);

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem("companyInfo", JSON.stringify(updated));
      return updated;
    });
  };

  const handleInvoiceSettingsChange = (field: keyof InvoiceSettings, value: string | number) => {
    setInvoiceSettings(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem("invoiceSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleEmailSettingsChange = (field: keyof EmailSettings, value: string) => {
    setEmailSettings(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem("emailSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const currencies = [
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "JPY - Japanese Yen", value: "JPY" },
    { label: "CAD - Canadian Dollar", value: "CAD" },
    { label: "AUD - Australian Dollar", value: "AUD" },
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "CNY - Chinese Yuan", value: "CNY" },
  ];

  const paymentTerms = [
    { label: "Net 7 - Due in 7 days", value: "7 days" },
    { label: "Net 14 - Due in 14 days", value: "14 days" },
    { label: "Net 30 - Due in 30 days", value: "30 days" },
    { label: "Net 45 - Due in 45 days", value: "45 days" },
    { label: "Net 60 - Due in 60 days", value: "60 days" },
    { label: "Net 90 - Due in 90 days", value: "90 days" },
  ];

  const taxRates = [
    { value: 0, label: "No Tax (0%)" },
    { value: 5, label: "5%" },
    { value: 7.5, label: "7.5%" },
    { value: 10, label: "10%" },
    { value: 12.5, label: "12.5%" },
    { value: 15, label: "15%" },
    { value: 20, label: "20%" }
  ];

  const handleExportData = () => {
    const data = {
      companyInfo,
      invoiceSettings,
      emailSettings,
      invoices: JSON.parse(localStorage.getItem("invoices") || "[]"),
      customers: JSON.parse(localStorage.getItem("customers") || "[]")
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing-system-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.companyInfo) {
          setCompanyInfo(data.companyInfo);
          localStorage.setItem("companyInfo", JSON.stringify(data.companyInfo));
        }
        
        if (data.invoiceSettings) {
          setInvoiceSettings(data.invoiceSettings);
          localStorage.setItem("invoiceSettings", JSON.stringify(data.invoiceSettings));
        }
        
        if (data.emailSettings) {
          setEmailSettings(data.emailSettings);
          localStorage.setItem("emailSettings", JSON.stringify(data.emailSettings));
        }
        
        if (data.invoices) {
          localStorage.setItem("invoices", JSON.stringify(data.invoices));
        }
        
        if (data.customers) {
          localStorage.setItem("customers", JSON.stringify(data.customers));
        }
        
        alert("Data imported successfully!");
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Error importing data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Tabs aria-label="Settings" color="primary">
        <Tab 
          key="company" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:building" width={18} />
              <span>Company</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Company Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                />
                <Input
                  label="Phone"
                  value={companyInfo.phone}
                  onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                />
                <Input
                  label="Website"
                  value={companyInfo.website}
                  onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                />
                <Input
                  label="Tax ID / VAT Number"
                  value={companyInfo.taxId}
                  onChange={(e) => handleCompanyInfoChange("taxId", e.target.value)}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Company Address"
                    value={companyInfo.address}
                    onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                  />
                </div>
              </div>
              
              <Divider />
              
              <div>
                <h4 className="text-medium font-semibold mb-2">Company Logo</h4>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border border-dashed border-divider rounded-lg flex items-center justify-center">
                    {companyInfo.logo ? (
                      <img 
                        src={companyInfo.logo} 
                        alt="Company Logo" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <Icon icon="lucide:image" className="text-foreground-300" width={32} />
                    )}
                  </div>
                  <div>
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      className="mb-2"
                    >
                      Upload Logo
                    </Button>
                    <p className="text-foreground-500 text-tiny">
                      Recommended size: 200x200px. Max file size: 1MB.
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        
        <Tab 
          key="invoice" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:file-text" width={18} />
              <span>Invoice</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Invoice Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Default Tax Rate"
                  selectedKeys={[invoiceSettings.defaultTaxRate.toString()]}
                  onChange={(e) => handleInvoiceSettingsChange("defaultTaxRate", parseFloat(e.target.value))}
                >
                  {taxRates.map((rate) => (
                    <SelectItem key={rate.value.toString()} value={rate.value.toString()}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <Select
                  label="Default Currency"
                  selectedKeys={[invoiceSettings.defaultCurrency]}
                  onChange={(e) => handleInvoiceSettingsChange("defaultCurrency", e.target.value)}
                >
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <Select
                  label="Default Payment Terms"
                  selectedKeys={[invoiceSettings.defaultPaymentTerms]}
                  onChange={(e) => handleInvoiceSettingsChange("defaultPaymentTerms", e.target.value)}
                >
                  {paymentTerms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <Divider />
              
              <h4 className="text-medium font-semibold">Invoice Numbering</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Prefix"
                  value={invoiceSettings.invoiceNumberPrefix}
                  onChange={(e) => handleInvoiceSettingsChange("invoiceNumberPrefix", e.target.value)}
                />
                <Input
                  label="Next Number"
                  type="number"
                  min="1"
                  value={invoiceSettings.nextInvoiceNumber.toString()}
                  onChange={(e) => handleInvoiceSettingsChange("nextInvoiceNumber", parseInt(e.target.value))}
                />
                <Input
                  label="Suffix"
                  value={invoiceSettings.invoiceNumberSuffix}
                  onChange={(e) => handleInvoiceSettingsChange("invoiceNumberSuffix", e.target.value)}
                />
                <Input
                  label="Number of Digits"
                  type="number"
                  min="1"
                  max="10"
                  value={invoiceSettings.invoiceNumberDigits.toString()}
                  onChange={(e) => handleInvoiceSettingsChange("invoiceNumberDigits", parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Textarea
                  label="Default Notes"
                  value={invoiceSettings.defaultNotes}
                  onChange={(e) => handleInvoiceSettingsChange("defaultNotes", e.target.value)}
                  placeholder="These notes will appear on all invoices"
                />
                <Textarea
                  label="Default Terms & Conditions"
                  value={invoiceSettings.defaultTerms}
                  onChange={(e) => handleInvoiceSettingsChange("defaultTerms", e.target.value)}
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
        
        <Tab 
          key="email" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:mail" width={18} />
              <span>Email</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Email Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Email Subject Template"
                  value={emailSettings.emailSubject}
                  onChange={(e) => handleEmailSettingsChange("emailSubject", e.target.value)}
                  description="Available variables: {invoiceNumber}, {company}, {amount}, {dueDate}"
                />
                <Textarea
                  label="Email Body Template"
                  value={emailSettings.emailTemplate}
                  onChange={(e) => handleEmailSettingsChange("emailTemplate", e.target.value)}
                  minRows={5}
                  description="Available variables: {customer}, {invoiceNumber}, {amount}, {dueDate}, {company}"
                />
                <Textarea
                  label="Email Signature"
                  value={emailSettings.emailSignature}
                  onChange={(e) => handleEmailSettingsChange("emailSignature", e.target.value)}
                  minRows={3}
                />
                <Input
                  label="CC Emails"
                  value={emailSettings.ccEmails}
                  onChange={(e) => handleEmailSettingsChange("ccEmails", e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                />
                <Input
                  label="BCC Emails"
                  value={emailSettings.bccEmails}
                  onChange={(e) => handleEmailSettingsChange("bccEmails", e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            </CardBody>
          </Card>
        </Tab>
        
        <Tab 
          key="data" 
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:database" width={18} />
              <span>Data</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Data Management</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardBody>
                    <h4 className="text-medium font-semibold mb-2">Export Data</h4>
                    <p className="text-foreground-500 text-small mb-4">
                      Export all your invoices, customers, and settings as a JSON file for backup.
                    </p>
                    <Button 
                      color="primary" 
                      variant="flat"
                      startContent={<Icon icon="lucide:download" width={16} />}
                      onPress={handleExportData}
                    >
                      Export Data
                    </Button>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <h4 className="text-medium font-semibold mb-2">Import Data</h4>
                    <p className="text-foreground-500 text-small mb-4">
                      Import previously exported data to restore your invoices and settings.
                    </p>
                    <label>
                      <Button 
                        color="primary" 
                        variant="flat"
                        startContent={<Icon icon="lucide:upload" width={16} />}
                        as="span"
                      >
                        Import Data
                      </Button>
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleImportData}
                      />
                    </label>
                  </CardBody>
                </Card>
              </div>
              
              <Divider />
              
              <div>
                <h4 className="text-medium font-semibold mb-2">Danger Zone</h4>
                <Card className="border border-danger">
                  <CardBody>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h5 className="text-medium font-semibold">Clear All Data</h5>
                        <p className="text-foreground-500 text-small">
                          This will permanently delete all your invoices, customers, and settings.
                        </p>
                      </div>
                      <Button 
                        color="danger" 
                        variant="flat"
                        onPress={() => {
                          if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                      >
                        Clear Data
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};