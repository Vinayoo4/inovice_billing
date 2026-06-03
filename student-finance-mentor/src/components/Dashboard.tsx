import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const TIPS = [
  "Pay yourself first: Put a portion of your income into savings immediately.",
  "Track every expense. You can't manage what you don't measure.",
  "Avoid minimum payments on credit cards to prevent debt spirals.",
  "Your emergency fund is an insurance policy, not an investment.",
  "If you can't buy it twice, you can't afford it.",
  "Start investing early to let compound interest work its magic.",
  "Negotiate your bills. Many services will offer a discount if you ask.",
  "Automate your savings and investments so you don't forget.",
  "Read the fine print on loan agreements to spot hidden fees.",
  "Delay purchases by 48 hours to avoid impulse buying."
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { budgets, expenses, lessons, progress } = useData();

  const [tipOfTheDay, setTipOfTheDay] = useState("");

  useEffect(() => {
    // Pick tip based on day of year so it stays consistent for a day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setTipOfTheDay(TIPS[dayOfYear % TIPS.length]);
  }, []);

  const userId = currentUser?.uid || "student1";
  const userProgress = progress[userId] || { completedLessons: [], quizScores: {} };

  // Calculate Budget Health
  const userBudget = budgets[userId];
  const budgetAmount = userBudget ? userBudget.total : 0;

  // Use current year-month to compute metrics, falling back to seed data month if none exist
  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  // We check if there are expenses in the current month, else fallback to '2024-05' for demo purposes
  const hasCurrentMonthExpenses = expenses.some(e => e.userId === userId && e.date.startsWith(currentYearMonth));
  const activeMonthPrefix = hasCurrentMonthExpenses ? currentYearMonth : "2024-05";

  const userExpenses = expenses.filter(e => e.userId === userId && e.date.startsWith(activeMonthPrefix));
  const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingPercentage = budgetAmount > 0 ? ((budgetAmount - totalSpent) / budgetAmount) * 100 : 0;

  let healthColor = "success";
  let healthText = "Excellent";
  if (budgetAmount === 0) {
    healthColor = "default";
    healthText = "No Budget Set";
  } else if (remainingPercentage < 10) {
    healthColor = "danger";
    healthText = "Critical";
  } else if (remainingPercentage <= 20) {
    healthColor = "warning";
    healthText = "Needs Attention";
  }

  // Calculate Lessons
  const totalLessons = lessons.length;
  const completedLessons = userProgress.completedLessons.length;

  // Calculate Quiz Average
  const scores = Object.values(userProgress.quizScores || {});
  const averageScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : "N/A";

  // Calculate Active Days
  const createdAt = currentUser?.createdAt ? new Date(currentUser.createdAt) : new Date();
  const activeDays = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.displayName}!</h1>
        <p className="text-foreground-500">Here's a snapshot of your financial learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Health */}
        <Card className={`border-t-4 border-${healthColor}`}>
          <CardBody className="p-5 flex flex-row items-center gap-4">
            <div className={`p-3 rounded-full bg-${healthColor}-100 text-${healthColor}-600`}>
              <Icon icon="lucide:wallet" width={24} />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Budget Health</p>
              <p className={`text-xl font-bold text-${healthColor}`}>{healthText}</p>
            </div>
          </CardBody>
        </Card>

        {/* Lessons Progress */}
        <Card className="border-t-4 border-primary">
          <CardBody className="p-5 flex flex-row items-center gap-4">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Icon icon="lucide:book-open" width={24} />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Lessons Finished</p>
              <p className="text-xl font-bold">{completedLessons} <span className="text-sm text-foreground-400">/ {totalLessons}</span></p>
            </div>
          </CardBody>
        </Card>

        {/* Quiz Avg */}
        <Card className="border-t-4 border-secondary">
          <CardBody className="p-5 flex flex-row items-center gap-4">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
              <Icon icon="lucide:graduation-cap" width={24} />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Avg Quiz Score</p>
              <p className="text-xl font-bold">{averageScore}</p>
            </div>
          </CardBody>
        </Card>

        {/* Days Active */}
        <Card className="border-t-4 border-success">
          <CardBody className="p-5 flex flex-row items-center gap-4">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <Icon icon="lucide:calendar" width={24} />
            </div>
            <div>
              <p className="text-sm text-foreground-500">Days Active</p>
              <p className="text-xl font-bold">{activeDays}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
          <CardBody className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <Icon icon="lucide:lightbulb" width={24} />
              <span className="font-semibold uppercase tracking-wider text-sm">Financial Tip of the Day</span>
            </div>
            <p className="text-2xl font-medium leading-relaxed">
              "{tipOfTheDay}"
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <Button
              color="primary"
              variant="flat"
              className="justify-start h-12 text-md"
              startContent={<Icon icon="lucide:calculator" width={20} />}
              onPress={() => navigate('/simulate')}
            >
              Run Life Simulation
            </Button>
            <Button
              color="primary"
              variant="flat"
              className="justify-start h-12 text-md"
              startContent={<Icon icon="lucide:trending-up" width={20} />}
              onPress={() => navigate('/loans')}
            >
              Loan EMI Calculator
            </Button>
            <Button
              color="primary"
              variant="flat"
              className="justify-start h-12 text-md"
              startContent={<Icon icon="lucide:wallet" width={20} />}
              onPress={() => navigate('/budget')}
            >
              Update Budget
            </Button>
            <Button
              color="primary"
              variant="flat"
              className="justify-start h-12 text-md"
              startContent={<Icon icon="lucide:book-open-check" width={20} />}
              onPress={() => navigate('/lessons')}
            >
              Continue Learning
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
