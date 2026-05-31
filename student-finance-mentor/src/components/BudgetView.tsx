import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Progress, Select, SelectItem, Slider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const BudgetView: React.FC = () => {
  const { budgetTemplates, budgets, expenses, saveBudget, saveExpense } = useData();
  const { currentUser } = useAuth();

  const userId = currentUser?.uid || "student1";

  const [monthlyIncome, setMonthlyIncome] = useState<string>("15000");
  const [categories, setCategories] = useState<{ name: string; percentage: number; amount: number }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("05");

  // Load from local storage draft or user's saved budget
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draftBudget_${userId}`);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setMonthlyIncome(draft.total.toString());
      setCategories(draft.categories);
    } else if (budgets[userId]) {
      setMonthlyIncome(budgets[userId].total.toString());
      setCategories(budgets[userId].categories);
    } else if (budgetTemplates.length > 0) {
      handleTemplateSelect(budgetTemplates[1].id); // Moderate default
    }
  }, [userId, budgets, budgetTemplates]);

  // Recalculate amounts whenever income or percentages change
  useEffect(() => {
    const income = parseFloat(monthlyIncome) || 0;
    const updatedCats = categories.map(cat => ({
      ...cat,
      amount: (cat.percentage / 100) * income
    }));

    // Only update if amount actually changed to avoid infinite loop
    const amountsChanged = updatedCats.some((c, i) => c.amount !== categories[i]?.amount);
    if (amountsChanged) {
       setCategories(updatedCats);
    }
  }, [monthlyIncome, categories]);

  // Autosave draft
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(`draftBudget_${userId}`, JSON.stringify({
        total: parseFloat(monthlyIncome) || 0,
        categories
      }));
    }
  }, [monthlyIncome, categories, userId]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = budgetTemplates.find(t => t.id === templateId);
    if (template) {
      const income = parseFloat(monthlyIncome) || 0;
      setCategories(template.categories.map(c => ({
        ...c,
        amount: (c.percentage / 100) * income
      })));
    }
  };

  const handleSliderChange = (index: number, newPercentage: number | number[]) => {
    const value = Array.isArray(newPercentage) ? newPercentage[0] : newPercentage;
    const newCats = [...categories];
    newCats[index].percentage = value;
    setCategories(newCats);
  };

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);

  // Filter expenses by month
  const userExpenses = expenses.filter(e => e.userId === userId && e.date.includes(`-2024-${selectedMonth}-`) || e.date.includes(`-2024-${selectedMonth}`)); // simplistic check for YYYY-MM
  const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetAmount = parseFloat(monthlyIncome) || 0;
  const remaining = budgetAmount - totalSpent;
  const remainingPercentage = budgetAmount > 0 ? (remaining / budgetAmount) * 100 : 0;

  let remainingColor: "success" | "warning" | "danger" = "success";
  if (remainingPercentage < 10) remainingColor = "danger";
  else if (remainingPercentage <= 20) remainingColor = "warning";

  const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  const handleAddSampleExpense = () => {
    if (categories.length === 0) return;
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = Math.floor(Math.random() * 500) + 50;
    const today = new Date();
    // mock a date in the selected month
    const mockDate = `2024-${selectedMonth}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;

    saveExpense({
      id: `e${Date.now()}`,
      userId,
      category: randomCat.name,
      amount: randomAmount,
      date: mockDate
    });
  };

  const resetToTemplate = () => {
    localStorage.removeItem(`draftBudget_${userId}`);
    if (selectedTemplate) {
      handleTemplateSelect(selectedTemplate);
    } else if (budgetTemplates.length > 0) {
      handleTemplateSelect(budgetTemplates[1].id);
    }
  };

  const saveToProfile = () => {
    if (totalPercentage === 100) {
      saveBudget(userId, { total: parseFloat(monthlyIncome) || 0, categories });
      // clear draft
      localStorage.removeItem(`draftBudget_${userId}`);
    }
  };

  // Prepare Chart Data
  const chartData = categories.map(cat => {
    const spentCat = userExpenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0);
    return {
      name: cat.name,
      Allocated: cat.amount,
      Spent: spentCat
    };
  });

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Budget</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between">
              <h2 className="text-xl font-semibold">Budget Setup</h2>
              <Button size="sm" variant="flat" onPress={resetToTemplate}>Reset</Button>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Choose a Template"
                selectedKeys={selectedTemplate ? [selectedTemplate] : []}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                {budgetTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name} ({t.description})</SelectItem>
                ))}
              </Select>

              <Input
                label="Monthly Income (₹)"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />

              <Divider />
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Categories Allocation</h3>
                <span className={`text-sm font-bold ${totalPercentage !== 100 ? 'text-danger' : 'text-success'}`}>
                  Total: {totalPercentage}% {totalPercentage !== 100 && '(Must equal 100%)'}
                </span>
              </div>

              <div className="space-y-6 mt-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="font-semibold">₹{cat.amount.toFixed(0)} ({cat.percentage}%)</span>
                    </div>
                    <Slider
                      aria-label={cat.name}
                      step={1}
                      maxValue={100}
                      minValue={0}
                      value={cat.percentage}
                      onChange={(val) => handleSliderChange(idx, val)}
                      className="max-w-md"
                    />
                  </div>
                ))}
              </div>

              <Button
                color="primary"
                className="w-full mt-4"
                onPress={saveToProfile}
                isDisabled={totalPercentage !== 100}
              >
                Save Budget
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Summary & Tracking</h2>
              <Select
                size="sm"
                className="w-32"
                selectedKeys={[selectedMonth]}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Month"
              >
                <SelectItem key="05" value="05">May 2024</SelectItem>
                <SelectItem key="06" value="06">Jun 2024</SelectItem>
              </Select>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground-500">Total Budget:</span>
                <span className="text-xl font-bold">₹{budgetAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-danger">
                <span>Total Spent:</span>
                <span>₹{totalSpent.toLocaleString()}</span>
              </div>
              <Divider />
              <div className={`flex justify-between items-center text-${remainingColor}`}>
                <span className="font-semibold">Remaining:</span>
                <span className="text-xl font-bold">₹{remaining.toLocaleString()}</span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-small mb-1">
                  <span>Budget utilized</span>
                  <span>{spentPercentage.toFixed(1)}%</span>
                </div>
                <Progress
                  value={spentPercentage}
                  color={spentPercentage > 90 ? "danger" : spentPercentage > 80 ? "warning" : "success"}
                  className="max-w-md"
                />
              </div>

              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="Allocated" fill="#8884d8" />
                    <Bar dataKey="Spent" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Expense Simulator</h2>
              <Button size="sm" color="secondary" onPress={handleAddSampleExpense}>
                Add Sample Expense
              </Button>
            </CardHeader>
            <CardBody>
              {userExpenses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userExpenses.slice().reverse().map(exp => (
                    <div key={exp.id} className="flex justify-between border-b border-divider py-2">
                      <div>
                        <p className="font-medium">{exp.category}</p>
                        <p className="text-small text-foreground-500">{exp.date}</p>
                      </div>
                      <span className="text-danger font-semibold">-₹{exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground-500">No expenses recorded for this month.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
