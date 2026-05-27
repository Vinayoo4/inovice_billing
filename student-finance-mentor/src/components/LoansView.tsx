import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useData } from "../context/DataContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export const LoansView: React.FC = () => {
  const { scenarios } = useData();

  // Helper to generate chart data for a scenario over time (annual compounding for simplicity)
  const generateChartData = (principal: number, rate: number, termYears: number) => {
    const data = [];
    let currentBalance = principal;
    for (let year = 0; year <= termYears; year++) {
      data.push({
        year: `Year ${year}`,
        balance: Math.round(currentBalance)
      });
      currentBalance = currentBalance * (1 + rate / 100);
    }
    return data;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Loan & Interest Scenarios</h1>
      <p className="text-foreground-500 mb-6">
        Explore how different interest rates affect the total cost of a loan over time.
      </p>

      {scenarios.length === 0 ? (
        <p>No scenarios available.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const chartData = generateChartData(scenario.principal, scenario.rate, scenario.term);
            const finalCost = chartData[chartData.length - 1].balance;
            const totalInterest = finalCost - scenario.principal;

            return (
              <Card key={scenario.id}>
                <CardHeader className="flex flex-col items-start pb-0">
                  <h2 className="text-xl font-semibold">{scenario.name}</h2>
                  <p className="text-small text-foreground-500">
                    Principal: ${scenario.principal} | Rate: {scenario.rate}% | Term: {scenario.term} years
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          name="Loan Balance"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-default-100 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost at End of Term:</span>
                      <span className="font-semibold text-danger">${finalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Interest Paid:</span>
                      <span className="font-semibold text-warning">${totalInterest.toLocaleString()}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
