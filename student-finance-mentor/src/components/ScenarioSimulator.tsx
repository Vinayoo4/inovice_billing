import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Select, SelectItem, Progress } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const scenarios = [
  {
    id: "s1",
    name: "First job in Bangalore",
    defaultIncome: 25000,
    rent: 12000,
    food: 6000,
    transport: 2000,
    misc: 3000
  },
  {
    id: "s2",
    name: "Student on stipend",
    defaultIncome: 8000,
    rent: 3000,
    food: 3000,
    transport: 1000,
    misc: 1000
  },
  {
    id: "s3",
    name: "Freelancer",
    defaultIncome: 18000,
    rent: 6000,
    food: 5000,
    transport: 1500,
    misc: 3500
  }
];

export const ScenarioSimulator: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>("s1");
  const [customIncome, setCustomIncome] = useState<string>("");

  const activeScenario = scenarios.find(s => s.id === selectedId) || scenarios[0];
  const currentIncome = customIncome !== "" ? parseFloat(customIncome) : activeScenario.defaultIncome;

  const handleScenarioChange = (id: string) => {
    setSelectedId(id);
    setCustomIncome(""); // Reset custom income when switching
  };

  const totalExpenses = activeScenario.rent + activeScenario.food + activeScenario.transport + activeScenario.misc;
  const savings = currentIncome - totalExpenses;
  const savingsRate = currentIncome > 0 ? (savings / currentIncome) * 100 : 0;

  const emergencyFundGoal = totalExpenses * 3;
  const monthsToEmergencyFund = savings > 0 ? Math.ceil(emergencyFundGoal / savings) : Infinity;

  // Generate 6 months of simulated data
  const generateChartData = () => {
    const data = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    for (let i = 0; i < 6; i++) {
      // Freelancer income fluctuates, others are stable
      const isFreelance = activeScenario.id === "s3";
      let monthIncome = currentIncome;
      if (isFreelance) {
        monthIncome = currentIncome * (1 + (Math.random() * 0.4 - 0.2)); // +/- 20% variance
      }

      const monthExpenses = totalExpenses; // Fixed for simplicity, but could also vary
      const monthSavings = monthIncome - monthExpenses;

      data.push({
        month: months[i],
        Income: Math.round(monthIncome),
        Rent: activeScenario.rent,
        Food: activeScenario.food,
        Transport: activeScenario.transport,
        Misc: activeScenario.misc,
        Savings: Math.max(0, Math.round(monthSavings))
      });
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Life Scenario Simulator</h1>
        <p className="text-foreground-500">
          See how different life phases impact your budget, savings rate, and financial health over 6 months.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Choose a Scenario</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Life Scenario"
                selectedKeys={[selectedId]}
                onChange={(e) => handleScenarioChange(e.target.value)}
              >
                {scenarios.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </Select>

              <div className="bg-primary-50 p-3 rounded text-sm text-primary-800 font-medium">
                Baseline Expenses for {activeScenario.name}: ₹{totalExpenses.toLocaleString()}/month
              </div>

              <Input
                label="Tweak Income (₹/month)"
                type="number"
                placeholder={activeScenario.defaultIncome.toString()}
                value={customIncome}
                onChange={(e) => setCustomIncome(e.target.value)}
                description="Change income to see how it affects savings and timeline."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Financial Health</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1 font-semibold">
                  <span>Savings Rate</span>
                  <span className={savingsRate < 10 ? 'text-danger' : savingsRate < 20 ? 'text-warning' : 'text-success'}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.max(0, savingsRate)}
                  maxValue={50}
                  color={savingsRate < 10 ? 'danger' : savingsRate < 20 ? 'warning' : 'success'}
                />
                <p className="text-tiny text-foreground-500 mt-1">Goal: 20% or higher.</p>
              </div>

              <div className="bg-default-100 p-3 rounded">
                <p className="text-sm font-semibold mb-1">Emergency Fund (3x Expenses)</p>
                <p className="text-xl font-bold">₹{emergencyFundGoal.toLocaleString()}</p>
                <p className="text-sm text-foreground-600 mt-1">
                  {savings > 0
                    ? `At current savings rate, it will take ${monthsToEmergencyFund} months to build this fund.`
                    : "You are not saving money. You cannot build an emergency fund."}
                </p>
              </div>

              <div className="bg-default-100 p-3 rounded">
                <p className="text-sm font-semibold mb-1">EMI Affordability (Max 30% rule)</p>
                <p className="text-xl font-bold">₹{Math.round(currentIncome * 0.3).toLocaleString()}/mo</p>
                <p className="text-sm text-foreground-600 mt-1">
                  Taking loans with EMIs above this amount puts you at high financial risk.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-xl font-semibold">6-Month Expense Projection</h2>
            </CardHeader>
            <CardBody>
               <div className="h-96 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Rent" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="Food" stackId="a" fill="#10b981" />
                      <Bar dataKey="Transport" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="Misc" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="Savings" stackId="a" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-center text-sm text-foreground-500 mt-4">
                 Stacked bars represent how your monthly income is allocated across expenses and savings.
                 {activeScenario.id === "s3" && " (Freelancer income is randomized +/- 20% to simulate real-world variance)."}
               </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
