import React from "react";
import { Card, CardBody, Button, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Invoice } from "./invoice-generator";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (invoice.taxRate / 100);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (invoice.discountType === "percentage") {
      return subtotal * (invoice.discount / 100);
    }
    return invoice.discount || 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          color="primary" 
          variant="flat" 
          startContent={<Icon icon="lucide:printer" width={16} />}
          onPress={handlePrint}
        >
          Print
        </Button>
        <Button 
          color="primary" 
          variant="flat" 
          startContent={<Icon icon="lucide:download" width={16} />}
          onPress={handleDownloadPDF}
        >
          Download PDF
        </Button>
        <Button 
          color="primary" 
          variant="flat" 
          startContent={<Icon icon="lucide:mail" width={16} />}
        >
          Email Invoice
        </Button>
      </div>
      
      <Card shadow="sm">
        <CardBody className="p-8" ref={componentRef}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary">INVOICE</h1>
              <p className="text-foreground-500 mt-1">#{invoice.invoiceNumber}</p>
              {invoice.recurring && (
                <Chip color="primary" variant="flat" size="sm" className="mt-2">
                  Recurring {invoice.recurringPeriod || "Monthly"}
                </Chip>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">{invoice.companyInfo.name}</h2>
              <p className="text-foreground-500 whitespace-pre-line">{invoice.companyInfo.address}</p>
              <p className="text-foreground-500">{invoice.companyInfo.email}</p>
              <p className="text-foreground-500">{invoice.companyInfo.phone}</p>
              <p className="text-foreground-500">{invoice.companyInfo.website}</p>
              {invoice.companyInfo.taxId && (
                <p className="text-foreground-500">Tax ID: {invoice.companyInfo.taxId}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold uppercase text-foreground-500 mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.customer.name}</p>
              <p className="whitespace-pre-line text-foreground-600">{invoice.customer.address}</p>
              <p className="text-foreground-600">{invoice.customer.email}</p>
            </div>
            <div className="md:text-right">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-foreground-500">Invoice Date:</p>
                <p className="font-medium md:text-right">{formatDate(invoice.date)}</p>
                
                <p className="text-foreground-500">Due Date:</p>
                <p className="font-medium md:text-right">{formatDate(invoice.dueDate)}</p>
                
                <p className="text-foreground-500">Status:</p>
                <p className="font-medium md:text-right">
                  <Chip 
                    color={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "default"} 
                    variant="flat"
                    size="sm"
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Chip>
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-content2 text-left">
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold text-right">Quantity</th>
                  <th className="p-3 font-semibold text-right">Unit Price</th>
                  <th className="p-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-divider">
                    <td className="p-3">{item.description || "Item description"}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-right">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="text-foreground-500">Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-foreground-500">
                    Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : ""}:
                  </span>
                  <span className="text-danger">-{formatCurrency(calculateDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-foreground-500">Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between py-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-lg">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
          
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase text-foreground-500 mb-2">Notes:</h3>
              <p className="text-foreground-600">{invoice.notes}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold uppercase text-foreground-500 mb-2">Terms & Conditions:</h3>
            <p className="text-foreground-600">{invoice.terms}</p>
          </div>
          
          <div className="mt-8 text-center text-foreground-400 text-sm">
            Thank you for your business!
          </div>
        </CardBody>
      </Card>
    </div>
  );
};