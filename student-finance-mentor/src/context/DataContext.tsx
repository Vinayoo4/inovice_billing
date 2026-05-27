import React, { createContext, useContext, useState, useEffect } from "react";
import seedData from "../data/seed.json";

export interface Budget {
  total: number;
  categories: { name: string; amount: number }[];
}

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  date: string;
}

export interface Scenario {
  id: string;
  name: string;
  principal: number;
  rate: number;
  term: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
}

export interface Progress {
  completedLessons: string[];
}

interface DataContextType {
  budgets: Record<string, Budget>;
  expenses: Expense[];
  scenarios: Scenario[];
  lessons: Lesson[];
  progress: Record<string, Progress>;
  loading: boolean;
  saveBudget: (userId: string, budget: Budget) => void;
  saveExpense: (expense: Expense) => void;
  saveScenario: (scenario: Scenario) => void;
  saveLesson: (lesson: Lesson) => void;
  updateProgress: (userId: string, lessonId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const storedBudgets = localStorage.getItem("budgets");
      const storedExpenses = localStorage.getItem("expenses");
      const storedScenarios = localStorage.getItem("scenarios");
      const storedLessons = localStorage.getItem("lessons");
      const storedProgress = localStorage.getItem("progress");

      if (!storedBudgets && !storedExpenses && !storedScenarios && !storedLessons && !storedProgress) {
        // Initialize with seed data
        setBudgets(seedData.budgets);
        setExpenses(seedData.expenses);
        setScenarios(seedData.scenarios);
        setLessons(seedData.lessons);
        setProgress(seedData.progress);

        localStorage.setItem("budgets", JSON.stringify(seedData.budgets));
        localStorage.setItem("expenses", JSON.stringify(seedData.expenses));
        localStorage.setItem("scenarios", JSON.stringify(seedData.scenarios));
        localStorage.setItem("lessons", JSON.stringify(seedData.lessons));
        localStorage.setItem("progress", JSON.stringify(seedData.progress));
      } else {
        setBudgets(storedBudgets ? JSON.parse(storedBudgets) : {});
        setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);
        setScenarios(storedScenarios ? JSON.parse(storedScenarios) : []);
        setLessons(storedLessons ? JSON.parse(storedLessons) : []);
        setProgress(storedProgress ? JSON.parse(storedProgress) : {});
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const saveBudget = (userId: string, budget: Budget) => {
    setBudgets((prev) => {
      const updated = { ...prev, [userId]: budget };
      localStorage.setItem("budgets", JSON.stringify(updated));
      return updated;
    });
  };

  const saveExpense = (expense: Expense) => {
    setExpenses((prev) => {
      const updated = [...prev, expense];
      localStorage.setItem("expenses", JSON.stringify(updated));
      return updated;
    });
  };

  const saveScenario = (scenario: Scenario) => {
    setScenarios((prev) => {
      const updated = [...prev, scenario];
      localStorage.setItem("scenarios", JSON.stringify(updated));
      return updated;
    });
  };

  const saveLesson = (lesson: Lesson) => {
    setLessons((prev) => {
      const updated = [...prev, lesson];
      localStorage.setItem("lessons", JSON.stringify(updated));
      return updated;
    });
  };

  const updateProgress = (userId: string, lessonId: string) => {
    setProgress((prev) => {
      const userProgress = prev[userId] || { completedLessons: [] };
      if (!userProgress.completedLessons.includes(lessonId)) {
        const updated = {
          ...prev,
          [userId]: { completedLessons: [...userProgress.completedLessons, lessonId] }
        };
        localStorage.setItem("progress", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const value = {
    budgets,
    expenses,
    scenarios,
    lessons,
    progress,
    loading,
    saveBudget,
    saveExpense,
    saveScenario,
    saveLesson,
    updateProgress,
  };

  return (
    <DataContext.Provider value={value}>
      {!loading && children}
    </DataContext.Provider>
  );
};
