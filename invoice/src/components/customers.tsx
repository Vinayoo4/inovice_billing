import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";
import { Invoice } from "./invoice-generator";

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [customerInvoices, setCustomerInvoices] = React.useState<Invoice[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const addModalDisclosure = useDisclosure();
  const rowsPerPage = 10;

  React.useEffect(() => {
    // Load customers from localStorage or use default ones
    const savedCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
    if (savedCustomers.length > 0) {
      setCustomers(savedCustomers);
    } else {
      // Import from invoice-data.ts
      import("../data/invoice-data").then(({ customers: defaultCustomers }) => {
        const formattedCustomers = defaultCustomers.map((customer: any) => ({
          ...customer,
          phone: customer.phone || "",
          company: customer.company || customer.name,
          notes: "",
          createdAt: new Date().toISOString()
        }));
        setCustomers(formattedCustomers);
        localStorage.setItem("customers", JSON.stringify(formattedCustomers));
      });
    }

    // Load invoices to associate with customers
    const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    setCustomerInvoices(savedInvoices);
  }, []);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newCustomer: Customer = {
      id: uuidv4(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      notes: formData.get("notes") as string,
      createdAt: new Date().toISOString()
    };
    
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    
    addModalDisclosure.onClose();
    form.reset();
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedCustomer: Customer = {
      ...selectedCustomer,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      notes: formData.get("notes") as string
    };
    
    const updatedCustomers = customers.map(customer => 
      customer.id === selectedCustomer.id ? updatedCustomer : customer
    );
    
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    
    onClose();
  };

  const getCustomerInvoices = (customerId: string) => {
    return customerInvoices.filter(
      invoice => invoice.customer.id === customerId || invoice.customer.name === customers.find(c => c.id === customerId)?.name
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.company && customer.company.toLowerCase().includes(searchLower))
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<Icon icon="lucide:search" className="text-default-400" width={16} />}
          className="w-full sm:max-w-xs"
        />
        <Button 
          color="primary" 
          startContent={<Icon icon="lucide:user-plus" width={16} />}
          onPress={addModalDisclosure.onOpen}
        >
          Add Customer
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table 
            aria-label="Customers table"
            removeWrapper
            classNames={{
              th: "bg-content2",
            }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>COMPANY</TableColumn>
              <TableColumn>INVOICES</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No customers found">
              {paginatedCustomers.map((customer) => {
                const customerInvoiceCount = getCustomerInvoices(customer.id).length;
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.company || "-"}</TableCell>
                    <TableCell>
                      {customerInvoiceCount > 0 ? (
                        <Chip color="primary" variant="flat" size="sm">
                          {customerInvoiceCount} invoice{customerInvoiceCount !== 1 ? 's' : ''}
                        </Chip>
                      ) : (
                        <Chip variant="flat" size="sm">No invoices</Chip>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleViewCustomer(customer)}
                        >
                          <Icon icon="lucide:eye" width={16} />
                        </Button>
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
                          <DropdownMenu aria-label="Customer actions">
                            <DropdownItem 
                              key="edit"
                              startContent={<Icon icon="lucide:edit" width={16} />}
                              onPress={() => handleViewCustomer(customer)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem 
                              key="invoice"
                              startContent={<Icon icon="lucide:file-plus" width={16} />}
                            >
                              Create Invoice
                            </DropdownItem>
                            <DropdownItem 
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Icon icon="lucide:trash-2" width={16} className="text-danger" />}
                              onPress={() => handleDeleteCustomer(customer.id)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

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

      {/* View/Edit Customer Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleEditCustomer}>
              <ModalHeader className="flex flex-col gap-1">
                Edit Customer
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    name="name"
                    defaultValue={selectedCustomer?.name}
                    isRequired
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={selectedCustomer?.email}
                    isRequired
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    defaultValue={selectedCustomer?.phone || ""}
                  />
                  <Input
                    label="Company"
                    name="company"
                    defaultValue={selectedCustomer?.company || ""}
                  />
                  <Textarea
                    label="Address"
                    name="address"
                    defaultValue={selectedCustomer?.address}
                    className="md:col-span-2"
                    isRequired
                  />
                  <Textarea
                    label="Notes"
                    name="notes"
                    defaultValue={selectedCustomer?.notes || ""}
                    className="md:col-span-2"
                  />
                </div>

                {selectedCustomer && getCustomerInvoices(selectedCustomer.id).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-medium font-semibold mb-2">Customer Invoices</h3>
                    <Table 
                      aria-label="Customer invoices"
                      removeWrapper
                      isStriped
                      isCompact
                    >
                      <TableHeader>
                        <TableColumn>INVOICE #</TableColumn>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {getCustomerInvoices(selectedCustomer.id).map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>{formatDate(invoice.date)}</TableCell>
                            <TableCell>
                              <Chip 
                                color={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "default"} 
                                variant="flat"
                                size="sm"
                              >
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Add Customer Modal */}
      <Modal 
        isOpen={addModalDisclosure.isOpen} 
        onOpenChange={addModalDisclosure.onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleAddCustomer}>
              <ModalHeader className="flex flex-col gap-1">
                Add New Customer
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    name="name"
                    isRequired
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    isRequired
                  />
                  <Input
                    label="Phone"
                    name="phone"
                  />
                  <Input
                    label="Company"
                    name="company"
                  />
                  <Textarea
                    label="Address"
                    name="address"
                    className="md:col-span-2"
                    isRequired
                  />
                  <Textarea
                    label="Notes"
                    name="notes"
                    className="md:col-span-2"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  Add Customer
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};