import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button, Chip, Progress, RadioGroup, Radio, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export const LessonsView: React.FC = () => {
  const { lessons, progress, updateProgress } = useData();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const userId = currentUser?.uid || "student1";
  const userProgress = progress[userId] || { completedLessons: [], quizScores: {} };

  const categories = ["All", ...Array.from(new Set(lessons.map(l => l.category)))];

  const filteredLessons = selectedCategory === "All"
    ? lessons
    : lessons.filter(l => l.category === selectedCategory);

  const completedCount = userProgress.completedLessons.length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const isCourseFinished = completedCount === totalLessons && totalLessons > 0;

  const handleStartLesson = (id: string) => {
    setActiveLessonId(id);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setActiveLessonId(null);
  };

  const handleQuizSubmit = (lessonId: string, quizData: any[]) => {
    let score = 0;
    quizData.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    updateProgress(userId, lessonId, score);
  };

  if (activeLessonId) {
    const lesson = lessons.find(l => l.id === activeLessonId);
    if (!lesson) return <p>Lesson not found.</p>;

    const isCompleted = userProgress.completedLessons.includes(lesson.id);
    const previousScore = userProgress.quizScores?.[lesson.id];

    return (
      <div className="p-4 max-w-3xl mx-auto space-y-6">
        <Button variant="light" onPress={handleBackToList} startContent={<Icon icon="lucide:arrow-left" width={16} />}>
          Back to Lessons
        </Button>

        <Card>
          <CardHeader className="flex flex-col items-start bg-primary-50">
            <div className="flex justify-between w-full mb-2">
              <Chip size="sm" color="primary" variant="flat">{lesson.category}</Chip>
              <div className="flex items-center gap-1 text-foreground-500 text-sm">
                <Icon icon="lucide:clock" />
                <span>{lesson.readTime}</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </CardHeader>
          <CardBody className="space-y-4 p-6">
            <div className="prose max-w-none whitespace-pre-line text-foreground-800 leading-relaxed text-lg">
              {lesson.content}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon icon="lucide:brain" className="text-secondary" /> Knowledge Check
            </h2>
          </CardHeader>
          <CardBody className="space-y-8">
            {lesson.quiz.map((q, idx) => (
              <div key={idx} className="space-y-3">
                <p className="font-semibold">{idx + 1}. {q.question}</p>
                <RadioGroup
                  value={quizAnswers[idx]?.toString() || ""}
                  onValueChange={(val) => setQuizAnswers(prev => ({...prev, [idx]: parseInt(val)}))}
                  isDisabled={quizSubmitted || isCompleted}
                >
                  {q.options.map((opt, oIdx) => {
                    let colorClass = "";
                    if ((quizSubmitted || isCompleted) && oIdx === q.correct) {
                      colorClass = "text-success font-semibold bg-success-50 rounded p-1";
                    } else if ((quizSubmitted || isCompleted) && quizAnswers[idx] === oIdx && oIdx !== q.correct) {
                      colorClass = "text-danger line-through";
                    }

                    return (
                      <Radio key={oIdx} value={oIdx.toString()}>
                        <span className={colorClass}>{opt}</span>
                      </Radio>
                    );
                  })}
                </RadioGroup>
              </div>
            ))}

            <Divider />

            {(!quizSubmitted && !isCompleted) ? (
              <Button
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                onPress={() => handleQuizSubmit(lesson.id, lesson.quiz)}
              >
                Submit Answers
              </Button>
            ) : (
              <div className={`p-4 rounded-lg text-center ${((quizScore || previousScore) === lesson.quiz.length) ? 'bg-success-100 text-success-800' : 'bg-primary-100 text-primary-800'}`}>
                <h3 className="text-lg font-bold mb-1">
                  Lesson Completed!
                </h3>
                <p>You scored {quizScore || previousScore || 0} out of {lesson.quiz.length}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Lessons</h1>
          <p className="text-foreground-500">
            Master the basics of personal finance and budgeting.
          </p>
        </div>

        <div className="w-full md:w-64">
           <div className="flex justify-between text-sm mb-1 font-semibold">
              <span>Your Progress</span>
              <span>{completedCount} / {totalLessons}</span>
           </div>
           <Progress value={progressPercent} color="success" className="w-full" />
        </div>
      </div>

      {isCourseFinished && (
        <Card className="bg-gradient-to-r from-success-400 to-success-600 text-white shadow-lg">
          <CardBody className="flex flex-row items-center gap-4 p-6">
            <div className="p-3 bg-white/20 rounded-full">
               <Icon icon="lucide:award" width={40} height={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">You finished the Finance Basics course!</h2>
              <p className="opacity-90">Great job completing all {totalLessons} lessons. You are now equipped with essential financial knowledge.</p>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Chip
            key={cat}
            color={selectedCategory === cat ? "primary" : "default"}
            variant={selectedCategory === cat ? "solid" : "flat"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const isCompleted = userProgress.completedLessons.includes(lesson.id);

          return (
            <Card key={lesson.id} isPressable onPress={() => handleStartLesson(lesson.id)} className={`hover:-translate-y-1 transition-transform ${isCompleted ? 'border-2 border-success-200 bg-success-50' : ''}`}>
              <CardBody className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <Chip size="sm" variant="flat" color={isCompleted ? "success" : "primary"}>
                    {lesson.category}
                  </Chip>
                  {isCompleted && (
                     <Icon icon="lucide:check-circle-2" className="text-success" width={24} />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 flex-1">{lesson.title}</h3>
                <div className="flex items-center text-sm text-foreground-500 mt-auto pt-4 gap-2">
                  <Icon icon="lucide:clock" />
                  <span>{lesson.readTime}</span>
                </div>
              </CardBody>
            </Card>
          );
        })}

        {filteredLessons.length === 0 && (
          <p className="col-span-full text-center text-foreground-500 py-8">No lessons found in this category.</p>
        )}
      </div>
    </div>
  );
};
