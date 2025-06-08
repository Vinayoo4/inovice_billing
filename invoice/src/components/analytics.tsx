import React from "react";
import { Card, CardBody, CardHeader, Divider, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Invoice } from "./invoice-generator";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

export const Analytics: React.FC = () => {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [timeRange, setTimeRange] = React.useState<"month" | "quarter" | "year">("month");

  React.useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    setInvoices(savedInvoices);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discount = invoice.discount || 0;
    const discountAmount = invoice.discountType === "percentage" ? subtotal * (discount / 100) : discount;
    const tax = (subtotal - discountAmount) * (invoice.taxRate / 100);
    return subtotal - discountAmount + tax;
  };

  const getTotalRevenue = () => {
    return invoices
      .filter(invoice => invoice.status === "paid")
      .reduce((sum, invoice) => sum + calculateTotal(invoice), 0);
  };

  const getPendingRevenue = () => {
    return invoices
      .filter(invoice => invoice.status === "pending")
      .reduce((sum, invoice) => sum + calculateTotal(invoice), 0);
  };

  const getDraftRevenue = () => {
    return invoices
      .filter(invoice => invoice.status === "draft")
      .reduce((sum, invoice) => sum + calculateTotal(invoice), 0);
  };

  const getMonthlyData = () => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
      return {
        name: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
        paid: 0,
        pending: 0,
        draft: 0
      };
    });

    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date);
      if (invoiceDate.getFullYear() === currentYear) {
        const month = invoiceDate.getMonth();
        const total = calculateTotal(invoice);
        
        if (invoice.status === "paid") {
          months[month].paid += total;
        } else if (invoice.status === "pending") {
          months[month].pending += total;
        } else {
          months[month].draft += total;
        }
      }
    });

    return months;
  };

  const getCustomerData = () => {
    const customerMap = new Map<string, number>();
    
    invoices.forEach(invoice => {
      if (invoice.status === "paid" || invoice.status === "pending") {
        const customerId = invoice.customer.id || invoice.customer.name;
        const currentTotal = customerMap.get(customerId) || 0;
        customerMap.set(customerId, currentTotal + calculateTotal(invoice));
      }
    });
    
    const result = Array.from(customerMap.entries())
      .map(([customerId, total]) => {
        const customer = invoices.find(inv => 
          inv.customer.id === customerId || inv.customer.name === customerId
        )?.customer;
        
        return {
          name: customer?.name || customerId,
          value: total
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    return result;
  };

  const getStatusData = () => {
    const paid = invoices.filter(inv => inv.status === "paid").length;
    const pending = invoices.filter(inv => inv.status === "pending").length;
    const draft = invoices.filter(inv => inv.status === "draft").length;
    
    return [
      { name: "Paid", value: paid, color: "#17c964" },
      { name: "Pending", value: pending, color: "#f5a524" },
      { name: "Draft", value: draft, color: "#a1a1aa" }
    ];
  };

  const monthlyData = getMonthlyData();
  const customerData = getCustomerData();
  const statusData = getStatusData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Financial Overview</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={timeRange === "month" ? "solid" : "flat"} 
            color={timeRange === "month" ? "primary" : "default"}
            onPress={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === "quarter" ? "solid" : "flat"} 
            color={timeRange === "quarter" ? "primary" : "default"}
            onPress={() => setTimeRange("quarter")}
          >
            Quarter
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === "year" ? "solid" : "flat"} 
            color={timeRange === "year" ? "primary" : "default"}
            onPress={() => setTimeRange("year")}
          >
            Year
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-col gap-2">
            <p className="text-foreground-500">Total Revenue</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold">{formatCurrency(getTotalRevenue())}</h3>
              <Chip color="success" variant="flat" size="sm">Paid</Chip>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-2">
            <p className="text-foreground-500">Pending Revenue</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold">{formatCurrency(getPendingRevenue())}</h3>
              <Chip color="warning" variant="flat" size="sm">Pending</Chip>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col gap-2">
            <p className="text-foreground-500">Draft Invoices</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-semibold">{formatCurrency(getDraftRevenue())}</h3>
              <Chip color="default" variant="flat" size="sm">Draft</Chip>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Revenue Trends</h4>
            <p className="text-foreground-500 text-small">Monthly revenue breakdown</p>
          </CardHeader>
          <CardBody className="overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  width={80}
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="paid" 
                  stackId="1"
                  stroke="#17c964" 
                  fill="#17c964" 
                  fillOpacity={0.6}
                  name="Paid"
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stackId="1"
                  stroke="#f5a524" 
                  fill="#f5a524" 
                  fillOpacity={0.6}
                  name="Pending"
                />
                <Area 
                  type="monotone" 
                  dataKey="draft" 
                  stackId="1"
                  stroke="#a1a1aa" 
                  fill="#a1a1aa" 
                  fillOpacity={0.6}
                  name="Draft"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Top Customers</h4>
            <p className="text-foreground-500 text-small">Revenue by customer</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={customerData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Customer: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#006FEE" 
                  radius={[0, 4, 4, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Invoice Status</h4>
            <p className="text-foreground-500 text-small">Distribution by status</p>
          </CardHeader>
          <CardBody className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `${value} invoices`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};