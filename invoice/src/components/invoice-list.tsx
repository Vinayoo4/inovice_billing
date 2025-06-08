import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Button,
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
  Input,
  Pagination,
  Tooltip,
  Badge,
  Card,
  CardBody
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Invoice } from "./invoice-generator";
import { InvoicePreview } from "./invoice-preview";
import { v4 as uuidv4 } from 'uuid';

export const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({
    column: "date",
    direction: "descending"
  });
  const rowsPerPage = 10;

  React.useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    setInvoices(savedInvoices);
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
      setInvoices(updatedInvoices);
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    }
  };

  const handleUpdateStatus = (id: string, status: "draft" | "pending" | "paid") => {
    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id === id) {
        return { ...invoice, status };
      }
      return invoice;
    });
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const newInvoice = {
      ...invoice,
      id: uuidv4(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft"
    };
    
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    alert("Invoice duplicated successfully!");
  };

  const handleSendEmail = (invoice: Invoice) => {
    // In a real app, this would connect to an email service
    alert(`Email with invoice ${invoice.invoiceNumber} would be sent to ${invoice.customer.email}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotal = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    return subtotal + tax;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === "paid") return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  const handleSortChange = (column: string) => {
    setSortDescriptor(prev => ({
      column,
      direction: prev.column === column && prev.direction === "ascending" ? "descending" : "ascending"
    }));
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.name.toLowerCase().includes(searchLower) ||
      invoice.status.toLowerCase().includes(searchLower)
    );
    
    if (statusFilter === "all") {
      return matchesSearch;
    }
    
    return matchesSearch && invoice.status === statusFilter;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const { column, direction } = sortDescriptor;
    const factor = direction === "ascending" ? 1 : -1;
    
    switch (column) {
      case "invoiceNumber":
        return a.invoiceNumber.localeCompare(b.invoiceNumber) * factor;
      case "customer":
        return a.customer.name.localeCompare(b.customer.name) * factor;
      case "date":
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * factor;
      case "dueDate":
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * factor;
      case "amount":
        return (calculateTotal(a) - calculateTotal(b)) * factor;
      default:
        return 0;
    }
  });

  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  const totalPages = Math.ceil(sortedInvoices.length / rowsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<Icon icon="lucide:search" className="text-default-400" width={16} />}
          className="w-full sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                endContent={<Icon icon="lucide:chevron-down" width={16} />}
              >
                {statusFilter === "all" ? "All Invoices" : 
                 statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Filter options"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) setStatusFilter(selected);
              }}
              selectionMode="single"
            >
              <DropdownItem key="all">All Invoices</DropdownItem>
              <DropdownItem key="paid">Paid</DropdownItem>
              <DropdownItem key="pending">Pending</DropdownItem>
              <DropdownItem key="draft">Draft</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<Icon icon="lucide:download" width={16} />}
          >
            Export
          </Button>
          <Button 
            color="primary" 
            startContent={<Icon icon="lucide:file-plus" width={16} />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-small">
        <p className="text-default-500">
          {filteredInvoices.length} invoices found
        </p>
        <div className="flex gap-2 items-center">
          <span className="text-default-500">Sort by:</span>
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="light" 
                size="sm"
                endContent={<Icon icon="lucide:chevron-down" width={14} />}
              >
                {sortDescriptor.column.charAt(0).toUpperCase() + sortDescriptor.column.slice(1)}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort options"
              onAction={(key) => handleSortChange(key as string)}
            >
              <DropdownItem key="date">Date</DropdownItem>
              <DropdownItem key="dueDate">Due Date</DropdownItem>
              <DropdownItem key="invoiceNumber">Invoice Number</DropdownItem>
              <DropdownItem key="customer">Customer</DropdownItem>
              <DropdownItem key="amount">Amount</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => handleSortChange(sortDescriptor.column)}
          >
            <Icon 
              icon={sortDescriptor.direction === "ascending" ? "lucide:arrow-up" : "lucide:arrow-down"} 
              width={16} 
            />
          </Button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-divider rounded-lg">
          <Icon icon="lucide:file-text" className="mx-auto text-foreground-300" width={48} height={48} />
          <h3 className="mt-4 text-lg font-medium">No invoices yet</h3>
          <p className="mt-1 text-foreground-500">Create your first invoice to get started</p>
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table 
              aria-label="Invoices table"
              removeWrapper
              classNames={{
                th: "bg-content2",
              }}
            >
              <TableHeader>
                <TableColumn>INVOICE #</TableColumn>
                <TableColumn>CUSTOMER</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>DUE DATE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No invoices found">
                {paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      {invoice.recurring && (
                        <Tooltip content="Recurring Invoice">
                          <Badge content={<Icon icon="lucide:repeat" width={10} />} color="primary" size="sm" className="ml-2" />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{invoice.customer.name}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {formatDate(invoice.dueDate)}
                        {isOverdue(invoice) && (
                          <Tooltip content="Overdue">
                            <Badge content={<Icon icon="lucide:alert-circle" width={10} />} color="danger" size="sm" />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(calculateTotal(invoice))}</TableCell>
                    <TableCell>
                      <Chip 
                        color={getStatusColor(invoice.status)} 
                        variant="flat"
                        size="sm"
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip content="View Invoice">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleViewInvoice(invoice)}
                          >
                            <Icon icon="lucide:eye" width={16} />
                          </Button>
                        </Tooltip>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                            >
                              <Icon icon="lucide:more-vertical" width={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Invoice actions">
                            <DropdownItem 
                              key="edit"
                              startContent={<Icon icon="lucide:edit" width={16} />}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem 
                              key="duplicate"
                              startContent={<Icon icon="lucide:copy" width={16} />}
                              onPress={() => handleDuplicateInvoice(invoice)}
                            >
                              Duplicate
                            </DropdownItem>
                            <DropdownItem 
                              key="send"
                              startContent={<Icon icon="lucide:send" width={16} />}
                              onPress={() => handleSendEmail(invoice)}
                            >
                              Send Email
                            </DropdownItem>
                            <DropdownItem 
                              key="download"
                              startContent={<Icon icon="lucide:download" width={16} />}
                            >
                              Download PDF
                            </DropdownItem>
                            <DropdownItem 
                              key="mark-paid"
                              startContent={<Icon icon="lucide:check-circle" width={16} />}
                              onPress={() => handleUpdateStatus(invoice.id, "paid")}
                            >
                              Mark as Paid
                            </DropdownItem>
                            <DropdownItem 
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash-2" width={16} className="text-danger" />}
                              onPress={() => handleDeleteInvoice(invoice.id)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            color="primary"
          />
        </div>
      )}

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
                Invoice Details
              </ModalHeader>
              <ModalBody>
                {selectedInvoice && <InvoicePreview invoice={selectedInvoice} />}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button 
                  color="primary" 
                  startContent={<Icon icon="lucide:send" width={16} />}
                  onPress={() => {
                    if (selectedInvoice) {
                      handleSendEmail(selectedInvoice);
                    }
                  }}
                >
                  Send to Customer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};