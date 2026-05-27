import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export const LessonsView: React.FC = () => {
  const { lessons, progress, updateProgress } = useData();
  const { currentUser } = useAuth();

  const userId = currentUser?.uid || "1";
  const userProgress = progress[userId] || { completedLessons: [] };

  const handleMarkCompleted = (lessonId: string) => {
    updateProgress(userId, lessonId);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Financial Lessons</h1>
      <p className="text-foreground-500 mb-6">
        Learn the basics of personal finance. Read through the lessons and mark them as completed.
      </p>

      {lessons.length === 0 ? (
        <p>No lessons available.</p>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const isCompleted = userProgress.completedLessons.includes(lesson.id);

            return (
              <Card key={lesson.id} className={isCompleted ? "border-success border-2" : ""}>
                <CardHeader className="flex justify-between items-center bg-default-50">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {isCompleted && <Icon icon="lucide:check-circle" className="text-success" width={20} />}
                    {lesson.title}
                  </h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="whitespace-pre-line">{lesson.content}</p>

                  <div className="flex justify-end pt-2">
                    {isCompleted ? (
                      <Button color="success" variant="flat" isDisabled startContent={<Icon icon="lucide:check" width={16} />}>
                        Completed
                      </Button>
                    ) : (
                      <Button color="primary" onPress={() => handleMarkCompleted(lesson.id)}>
                        Mark as Read
                      </Button>
                    )}
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
