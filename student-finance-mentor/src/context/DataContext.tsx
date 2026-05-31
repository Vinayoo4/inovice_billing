import React, { createContext, useContext, useState, useEffect } from "react";
import seedData from "../data/seed.json";

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  categories: { name: string; percentage: number }[];
}

export interface Budget {
  total: number;
  categories: { name: string; amount: number; percentage: number }[];
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

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  readTime: string;
  content: string;
  quiz: QuizQuestion[];
}

export interface Progress {
  completedLessons: string[];
  quizScores: Record<string, number>; // lessonId -> score
}

interface DataContextType {
  budgetTemplates: BudgetTemplate[];
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
  updateProgress: (userId: string, lessonId: string, score: number) => void;
  deleteScenario: (id: string) => void;
  deleteLesson: (id: string) => void;
  resetProgress: () => void;
  reseedData: () => void;
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
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetTemplate[]>([]);
  const [budgets, setBudgets] = useState<Record<string, Budget>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  const seedAllData = () => {
    setBudgetTemplates(seedData.budgetTemplates || []);
    setExpenses(seedData.expenses || []);
    setScenarios(seedData.scenarios || []);
    setLessons(seedData.lessons || []);

    // Check if users exist in localStorage, if not seed them
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(seedData.users));
    }

    localStorage.setItem("budgetTemplates", JSON.stringify(seedData.budgetTemplates));
    localStorage.setItem("expenses", JSON.stringify(seedData.expenses));
    localStorage.setItem("scenarios", JSON.stringify(seedData.scenarios));
    localStorage.setItem("lessons", JSON.stringify(seedData.lessons));
    localStorage.setItem("_seeded", "true");
  };

  useEffect(() => {
    const loadData = () => {
      const isSeeded = localStorage.getItem("_seeded");

      if (!isSeeded) {
        seedAllData();
        setBudgets({});
        setProgress({});
      } else {
        const storedTemplates = localStorage.getItem("budgetTemplates");
        const storedBudgets = localStorage.getItem("budgets");
        const storedExpenses = localStorage.getItem("expenses");
        const storedScenarios = localStorage.getItem("scenarios");
        const storedLessons = localStorage.getItem("lessons");
        const storedProgress = localStorage.getItem("progress");

        setBudgetTemplates(storedTemplates ? JSON.parse(storedTemplates) : seedData.budgetTemplates);
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

  const deleteScenario = (id: string) => {
    setScenarios((prev) => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem("scenarios", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => {
      const updated = prev.filter(l => l.id !== id);
      localStorage.setItem("lessons", JSON.stringify(updated));
      return updated;
    });
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("progress");
  };

  const reseedData = () => {
    localStorage.clear();
    seedAllData();
    setBudgets({});
    setProgress({});
    window.location.reload();
  };

  const updateProgress = (userId: string, lessonId: string, score: number) => {
    setProgress((prev) => {
      const userProgress = prev[userId] || { completedLessons: [], quizScores: {} };
      const completed = userProgress.completedLessons.includes(lessonId)
        ? userProgress.completedLessons
        : [...userProgress.completedLessons, lessonId];

      const updated = {
        ...prev,
        [userId]: {
          completedLessons: completed,
          quizScores: { ...userProgress.quizScores, [lessonId]: score }
        }
      };
      localStorage.setItem("progress", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    budgetTemplates,
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
    deleteScenario,
    deleteLesson,
    resetProgress,
    reseedData
  };

  return (
    <DataContext.Provider value={value}>
      {!loading && children}
    </DataContext.Provider>
  );
};
