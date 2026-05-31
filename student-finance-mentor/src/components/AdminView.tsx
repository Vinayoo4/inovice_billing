import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Tabs, Tab, Textarea, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";
import { useData } from "../context/DataContext";
import { Icon } from "@iconify/react";

export const AdminView: React.FC = () => {
  const { scenarios, lessons, progress, saveScenario, saveLesson, deleteScenario, deleteLesson, resetProgress, reseedData } = useData();

  // Scenario form state
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioPrincipal, setScenarioPrincipal] = useState("");
  const [scenarioRate, setScenarioRate] = useState("");
  const [scenarioTerm, setScenarioTerm] = useState("");

  // Lesson form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonCategory, setLessonCategory] = useState("");
  const [lessonReadTime, setLessonReadTime] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const handleAddScenario = () => {
    if (scenarioName && scenarioPrincipal && scenarioRate && scenarioTerm) {
      saveScenario({
        id: `s${Date.now()}`,
        name: scenarioName,
        principal: parseFloat(scenarioPrincipal),
        rate: parseFloat(scenarioRate),
        term: parseInt(scenarioTerm, 10)
      });
      setScenarioName("");
      setScenarioPrincipal("");
      setScenarioRate("");
      setScenarioTerm("");
    }
  };

  const handleAddLesson = () => {
    if (lessonTitle && lessonContent) {
      saveLesson({
        id: `l${Date.now()}`,
        title: lessonTitle,
        category: lessonCategory || "General",
        readTime: lessonReadTime || "5 min",
        content: lessonContent,
        quiz: [] // Add mock quiz logic if needed for custom lessons
      });
      setLessonTitle("");
      setLessonCategory("");
      setLessonReadTime("");
      setLessonContent("");
    }
  };

  const getUsers = () => {
    try {
      const usersStr = localStorage.getItem('users');
      if (usersStr) return JSON.parse(usersStr);
    } catch(e) {
      console.error(e);
    }
    return [];
  };

  const users = getUsers();

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-foreground-500">Manage application content and user data.</p>
        </div>
      </div>

      <Tabs aria-label="Admin Options" color="primary" variant="underlined" classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}>

        {/* LESSONS TAB */}
        <Tab key="lessons" title={
          <div className="flex items-center space-x-2">
            <Icon icon="lucide:book-open" />
            <span>Lessons</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <h2 className="text-xl font-semibold">Add New Lesson</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                <Input label="Category" value={lessonCategory} onChange={(e) => setLessonCategory(e.target.value)} />
                <Input label="Read Time (e.g., 3 min)" value={lessonReadTime} onChange={(e) => setLessonReadTime(e.target.value)} />
                <Textarea label="Content" minRows={6} value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} />
                <Button color="primary" onPress={handleAddLesson} className="w-full">Create Lesson</Button>
              </CardBody>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold flex justify-between items-center w-full">
                  <span>Manage Lessons</span>
                  <Chip size="sm">{lessons.length} total</Chip>
                </h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Lessons table">
                  <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {lessons.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.title}</TableCell>
                        <TableCell><Chip size="sm" variant="flat">{l.category}</Chip></TableCell>
                        <TableCell>
                           <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => deleteLesson(l.id)}>
                             <Icon icon="lucide:trash-2" width={16} />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* SCENARIOS TAB */}
        <Tab key="scenarios" title={
          <div className="flex items-center space-x-2">
            <Icon icon="lucide:trending-up" />
            <span>Loan Scenarios</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <h2 className="text-xl font-semibold">Add Loan Scenario</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Scenario Name" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
                <Input label="Principal (₹)" type="number" value={scenarioPrincipal} onChange={(e) => setScenarioPrincipal(e.target.value)} />
                <Input label="Rate (%)" type="number" step="0.1" value={scenarioRate} onChange={(e) => setScenarioRate(e.target.value)} />
                <Input label="Term (Years)" type="number" value={scenarioTerm} onChange={(e) => setScenarioTerm(e.target.value)} />
                <Button color="primary" onPress={handleAddScenario} className="w-full">Create Scenario</Button>
              </CardBody>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold flex justify-between items-center w-full">
                  <span>Manage Scenarios</span>
                  <Chip size="sm">{scenarios.length} total</Chip>
                </h2>
              </CardHeader>
              <CardBody>
                <Table aria-label="Scenarios table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>PRINCIPAL</TableColumn>
                    <TableColumn>RATE/TERM</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {scenarios.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>₹{s.principal.toLocaleString()}</TableCell>
                        <TableCell>{s.rate}% for {s.term} yrs</TableCell>
                        <TableCell>
                           <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => deleteScenario(s.id)}>
                             <Icon icon="lucide:trash-2" width={16} />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* STUDENTS TAB */}
        <Tab key="students" title={
          <div className="flex items-center space-x-2">
            <Icon icon="lucide:users" />
            <span>Students</span>
          </div>
        }>
          <Card className="mt-4">
            <CardHeader>
              <h2 className="text-xl font-semibold">Registered Users</h2>
            </CardHeader>
            <CardBody>
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>LESSONS DONE</TableColumn>
                  <TableColumn>QUIZ AVG</TableColumn>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => {
                    const userProg = progress[u.uid] || { completedLessons: [], quizScores: {} };
                    const scores = Object.values(userProg.quizScores) as number[];
                    const avg = scores.length > 0 ? (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : "N/A";

                    return (
                      <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.displayName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip size="sm" color={u.role === 'admin' ? "secondary" : "default"}>{u.role}</Chip>
                        </TableCell>
                        <TableCell>{userProg.completedLessons.length} / {lessons.length}</TableCell>
                        <TableCell>{avg}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        {/* SETTINGS TAB */}
        <Tab key="settings" title={
          <div className="flex items-center space-x-2">
            <Icon icon="lucide:settings" />
            <span>Settings</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card className="border-warning border">
              <CardBody className="p-6 text-center space-y-4">
                <div className="mx-auto bg-warning-100 text-warning p-3 rounded-full w-fit">
                   <Icon icon="lucide:rotate-ccw" width={32} />
                </div>
                <h3 className="text-xl font-bold">Reset Progress</h3>
                <p className="text-foreground-500 text-sm">
                  This will clear all lesson completions and quiz scores for all users. Budgets and custom scenarios will remain.
                </p>
                <Button color="warning" className="w-full" onPress={() => {
                  if (confirm("Are you sure you want to reset all progress?")) {
                    resetProgress();
                  }
                }}>
                  Reset All Progress
                </Button>
              </CardBody>
            </Card>

            <Card className="border-danger border">
              <CardBody className="p-6 text-center space-y-4">
                <div className="mx-auto bg-danger-100 text-danger p-3 rounded-full w-fit">
                   <Icon icon="lucide:alert-triangle" width={32} />
                </div>
                <h3 className="text-xl font-bold">Factory Reset</h3>
                <p className="text-foreground-500 text-sm">
                  This will wipe all local storage data, destroying custom budgets and accounts, and re-seed the initial dataset.
                </p>
                <Button color="danger" className="w-full" onPress={() => {
                  if (confirm("WARNING: This destroys all data and logs you out. Proceed?")) {
                    reseedData();
                  }
                }}>
                  Hard Reset & Reseed
                </Button>
              </CardBody>
            </Card>
          </div>
        </Tab>

      </Tabs>
    </div>
  );
};
