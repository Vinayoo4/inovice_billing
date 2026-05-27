import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Textarea } from "@heroui/react";
import { useData } from "../context/DataContext";

export const AdminView: React.FC = () => {
  const { scenarios, lessons, saveScenario, saveLesson } = useData();

  // Scenario form state
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioPrincipal, setScenarioPrincipal] = useState("");
  const [scenarioRate, setScenarioRate] = useState("");
  const [scenarioTerm, setScenarioTerm] = useState("");

  // Lesson form state
  const [lessonTitle, setLessonTitle] = useState("");
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
        content: lessonContent
      });
      setLessonTitle("");
      setLessonContent("");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manage Scenarios */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Add Loan Scenario</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Scenario Name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <Input
                label="Principal Amount ($)"
                type="number"
                value={scenarioPrincipal}
                onChange={(e) => setScenarioPrincipal(e.target.value)}
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.1"
                value={scenarioRate}
                onChange={(e) => setScenarioRate(e.target.value)}
              />
              <Input
                label="Term (Years)"
                type="number"
                value={scenarioTerm}
                onChange={(e) => setScenarioTerm(e.target.value)}
              />
              <Button color="primary" onPress={handleAddScenario}>Add Scenario</Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Existing Scenarios</h2>
            </CardHeader>
            <CardBody>
              {scenarios.map(s => (
                <div key={s.id} className="mb-2 p-2 bg-default-100 rounded">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-foreground-500">
                    ${s.principal} | {s.rate}% | {s.term} yrs
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Manage Lessons */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Add Financial Lesson</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Lesson Title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
              <Textarea
                label="Lesson Content"
                minRows={4}
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
              />
              <Button color="primary" onPress={handleAddLesson}>Add Lesson</Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Existing Lessons</h2>
            </CardHeader>
            <CardBody>
              {lessons.map(l => (
                <div key={l.id} className="mb-2 p-2 bg-default-100 rounded">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-sm text-foreground-500 truncate">{l.content}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
