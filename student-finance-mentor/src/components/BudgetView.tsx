import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export const BudgetView: React.FC = () => {
  const { budgets, expenses, saveBudget } = useData();
  const { currentUser } = useAuth();

  const userId = currentUser?.uid || "1";

  const [totalBudget, setTotalBudget] = useState<string>("");
  const [categories, setCategories] = useState<{ name: string; amount: number }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");

  useEffect(() => {
    if (budgets[userId]) {
      setTotalBudget(budgets[userId].total.toString());
      setCategories(budgets[userId].categories);
    }
  }, [budgets, userId]);

  const handleSaveBudget = () => {
    const budgetTotal = parseFloat(totalBudget);
    if (!isNaN(budgetTotal)) {
      saveBudget(userId, { total: budgetTotal, categories });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryAmount) {
      const amount = parseFloat(newCategoryAmount);
      if (!isNaN(amount)) {
        const newCats = [...categories, { name: newCategoryName, amount }];
        setCategories(newCats);
        setNewCategoryName("");
        setNewCategoryAmount("");
      }
    }
  };

  const handleRemoveCategory = (index: number) => {
    const newCats = categories.filter((_, i) => i !== index);
    setCategories(newCats);
  };

  // Calculate expenses
  const userExpenses = expenses.filter(e => e.userId === userId);
  const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetAmount = parseFloat(totalBudget) || 0;
  const remaining = budgetAmount - totalSpent;
  const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Budget</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Budget Summary</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-foreground-500">Total Budget:</span>
              <span className="text-xl font-bold">${budgetAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-danger">
              <span>Total Spent:</span>
              <span>${totalSpent.toFixed(2)}</span>
            </div>
            <Divider />
            <div className="flex justify-between items-center text-success">
              <span className="font-semibold">Remaining:</span>
              <span className="text-xl font-bold">${remaining.toFixed(2)}</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-small mb-1">
                <span>Budget utilized</span>
                <span>{spentPercentage.toFixed(1)}%</span>
              </div>
              <Progress
                value={spentPercentage}
                color={spentPercentage > 90 ? "danger" : spentPercentage > 75 ? "warning" : "success"}
                className="max-w-md"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Draft Budget</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Total Monthly Budget ($)"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />

            <Divider />
            <h3 className="font-semibold">Categories</h3>

            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center bg-default-100 p-2 rounded">
                  <span>{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${cat.amount}</span>
                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleRemoveCategory(idx)}>
                      <Icon icon="lucide:trash-2" width={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 items-end">
              <Input
                label="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                size="sm"
              />
              <Input
                label="Amount ($)"
                type="number"
                value={newCategoryAmount}
                onChange={(e) => setNewCategoryAmount(e.target.value)}
                size="sm"
              />
              <Button color="secondary" onPress={handleAddCategory}>Add</Button>
            </div>

            <Button color="primary" className="w-full mt-4" onPress={handleSaveBudget}>
              Save Budget
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Simulated Expenses (from logs)</h2>
        </CardHeader>
        <CardBody>
          {userExpenses.length > 0 ? (
            <div className="space-y-2">
              {userExpenses.map(exp => (
                <div key={exp.id} className="flex justify-between border-b border-divider py-2">
                  <div>
                    <p className="font-medium">{exp.category}</p>
                    <p className="text-small text-foreground-500">{exp.date}</p>
                  </div>
                  <span className="text-danger font-semibold">-${exp.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground-500">No expenses recorded yet.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
