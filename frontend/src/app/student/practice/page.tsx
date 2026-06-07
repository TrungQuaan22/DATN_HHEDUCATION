"use client";

import React from "react";
import { usePracticeRoom } from "@/features/courses/hooks/use-practice-room";
import { PracticeConfig } from "@/features/courses/components/practice-config";
import { PracticeQuiz } from "@/features/courses/components/practice-quiz";
import { PracticeResult } from "@/features/courses/components/practice-result";

export default function PracticeRoomPage() {
  const {
    activeScreen,
    selectedSubject,
    setSelectedSubject,
    difficulty,
    setDifficulty,
    quizQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    timeLeft,
    finalScore,
    correctCount,
    historyList,
    selectAnswer,
    handleQuizSubmit,
    handleStartPractice,
    quitPractice,
  } = usePracticeRoom();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {activeScreen === "config" && (
        <PracticeConfig
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          historyList={historyList}
          handleStartPractice={handleStartPractice}
        />
      )}

      {activeScreen === "quiz" && (
        <PracticeQuiz
          quizQuestions={quizQuestions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          userAnswers={userAnswers}
          selectAnswer={selectAnswer}
          timeLeft={timeLeft}
          difficulty={difficulty}
          selectedSubject={selectedSubject}
          handleQuizSubmit={handleQuizSubmit}
          quitPractice={quitPractice}
        />
      )}

      {activeScreen === "result" && (
        <PracticeResult
          quizQuestions={quizQuestions}
          userAnswers={userAnswers}
          finalScore={finalScore}
          correctCount={correctCount}
          quitPractice={quitPractice}
        />
      )}
    </div>
  );
}
