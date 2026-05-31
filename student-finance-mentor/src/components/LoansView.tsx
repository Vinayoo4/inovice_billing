import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Slider, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useData } from "../context/DataContext";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export const LoansView: React.FC = () => {
  const { scenarios } = useData();

  // Custom scenario state
  const [customPrincipal, setCustomPrincipal] = useState("500000");
  const [customRate, setCustomRate] = useState("10");
  const [customTerm, setCustomTerm] = useState("5");
  const [extraPayment, setExtraPayment] = useState(0);

  // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (principal: number, annualRate: number, termYears: number) => {
    if (annualRate === 0) return principal / (termYears * 12);
    const monthlyRate = annualRate / 12 / 100;
    const months = termYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const calculateAmortization = (principal: number, annualRate: number, termYears: number, extraPaymentAmount: number = 0) => {
    const data = [];
    let currentBalance = principal;
    const baseEmi = calculateEMI(principal, annualRate, termYears);
    const actualEmi = baseEmi + extraPaymentAmount;
    const monthlyRate = annualRate / 12 / 100;
    let totalInterest = 0;
    let month = 0;

    data.push({ month: 0, balance: Math.round(currentBalance) });

    while (currentBalance > 0 && month < termYears * 12 * 2) { // safety limit
      month++;
      const interestPayment = currentBalance * monthlyRate;
      let principalPayment = actualEmi - interestPayment;

      if (currentBalance < principalPayment) {
        principalPayment = currentBalance;
      }

      currentBalance -= principalPayment;
      totalInterest += interestPayment;

      if (month % 12 === 0 || currentBalance <= 0) {
        data.push({
          month: month,
          year: `Year ${Math.ceil(month / 12)}`,
          balance: Math.max(0, Math.round(currentBalance))
        });
      }
    }

    return { data, totalInterest: Math.round(totalInterest), monthsTaken: month, emi: baseEmi };
  };

  const COLORS = ['#1d4ed8', '#ef4444'];

  const renderScenarioCard = (s: any, isCustom = false) => {
    const amort = calculateAmortization(s.principal, s.rate, s.term, isCustom ? extraPayment : 0);
    const totalPayable = s.principal + amort.totalInterest;

    const pieData = [
      { name: 'Principal', value: s.principal },
      { name: 'Total Interest', value: amort.totalInterest },
    ];

    return (
      <Card key={s.id} className={isCustom ? "border-2 border-primary" : ""}>
        <CardHeader className="flex flex-col items-start pb-0">
          <h2 className="text-xl font-semibold">{s.name}</h2>
          <p className="text-small text-foreground-500">
            Principal: ₹{s.principal.toLocaleString()} | Rate: {s.rate}% | Term: {s.term} years
          </p>
        </CardHeader>
        <CardBody>
           <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
             <div className="bg-default-100 p-2 rounded">
               <p className="text-tiny text-foreground-500 uppercase">Monthly EMI</p>
               <p className="text-lg font-bold">₹{amort.emi.toLocaleString()}</p>
             </div>
             <div className="bg-default-100 p-2 rounded">
               <p className="text-tiny text-foreground-500 uppercase">Total Payable</p>
               <p className="text-lg font-bold">₹{totalPayable.toLocaleString()}</p>
             </div>
             <div className="bg-default-100 p-2 rounded col-span-2">
               <p className="text-tiny text-foreground-500 uppercase">Total Interest Burden</p>
               <p className="text-lg font-bold text-danger">₹{amort.totalInterest.toLocaleString()}</p>
             </div>
           </div>

          <div className="flex flex-col md:flex-row gap-4 h-64">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={amort.data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(val) => `₹${(val/1000)}k`} />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 h-full">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {isCustom && (
            <div className="mt-6">
              <p className="font-semibold mb-2">What if I pay extra each month?</p>
              <div className="flex justify-between text-sm mb-1">
                <span>Extra Payment: ₹{extraPayment.toLocaleString()}</span>
                {extraPayment > 0 && <span className="text-success font-semibold">Saves {Math.max(0, s.term * 12 - amort.monthsTaken)} months!</span>}
              </div>
              <Slider
                step={500}
                maxValue={50000}
                minValue={0}
                value={extraPayment}
                onChange={(v) => setExtraPayment(v as number)}
              />
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const customScenario = {
    id: 'custom',
    name: 'Custom Simulator',
    principal: parseFloat(customPrincipal) || 0,
    rate: parseFloat(customRate) || 0,
    term: parseFloat(customTerm) || 0
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Loan & EMI Simulator</h1>
          <p className="text-foreground-500">
            Compare scenarios to see how interest rate and term affect total cost.
          </p>
        </div>
        <div className="bg-warning-50 text-warning-800 px-3 py-2 rounded-lg text-sm font-semibold max-w-xs text-center border border-warning-200">
          Disclaimer: This is educational only. Not financial advice.
        </div>
      </div>

      <div className="bg-default-50 p-4 rounded-xl border border-divider">
        <h2 className="text-lg font-semibold mb-2">How is EMI Calculated?</h2>
        <p className="font-mono text-sm bg-default-200 p-2 rounded inline-block mb-2 text-primary-700 font-semibold">
          EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
        </p>
        <p className="text-sm text-foreground-600">
          Where P = Principal, R = Monthly Rate (Annual / 12 / 100), N = Term in Months.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Build Custom Scenario</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Principal Amount (₹)"
                type="number"
                value={customPrincipal}
                onChange={(e) => setCustomPrincipal(e.target.value)}
              />
              <Input
                label="Interest Rate (% p.a.)"
                type="number"
                step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
              />
              <Input
                label="Term (Years)"
                type="number"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
              />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {renderScenarioCard(customScenario, true)}
        </div>
      </div>

      <Divider className="my-8" />

      <h2 className="text-2xl font-bold">Standard Scenarios</h2>

      <div className="overflow-x-auto">
        <Table aria-label="Scenario Comparison">
          <TableHeader>
            <TableColumn>SCENARIO</TableColumn>
            <TableColumn>PRINCIPAL</TableColumn>
            <TableColumn>RATE</TableColumn>
            <TableColumn>TERM</TableColumn>
            <TableColumn>EMI</TableColumn>
            <TableColumn>TOTAL INTEREST</TableColumn>
          </TableHeader>
          <TableBody>
             {[...scenarios, customScenario].map(s => {
               const amort = calculateAmortization(s.principal, s.rate, s.term);
               return (
                 <TableRow key={s.id} className={s.id === 'custom' ? 'bg-primary-50' : ''}>
                   <TableCell className="font-semibold">{s.name}</TableCell>
                   <TableCell>₹{s.principal.toLocaleString()}</TableCell>
                   <TableCell>{s.rate}%</TableCell>
                   <TableCell>{s.term} yrs</TableCell>
                   <TableCell className="font-semibold">₹{amort.emi.toLocaleString()}</TableCell>
                   <TableCell className="text-danger">₹{amort.totalInterest.toLocaleString()}</TableCell>
                 </TableRow>
               );
             })}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {scenarios.map(s => renderScenarioCard(s))}
      </div>
    </div>
  );
};
