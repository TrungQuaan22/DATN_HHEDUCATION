"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MockQuestion,
  HistoryItem,
  mockQuestionsData,
  SUBJECT_LABELS,
} from "../practice-mock";

export function usePracticeRoom() {
  const [activeScreen, setActiveScreen] = useState<
    "config" | "quiz" | "result"
  >("config");

  // Config state
  const [selectedSubject, setSelectedSubject] = useState<
    "math" | "literature" | "english"
  >("literature");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<MockQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D">
  >({});
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes

  // Results state
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    {
      id: "hist-1",
      title: "Luyện tập Từ Hán Việt & Thuật ngữ",
      score: 8.0,
      totalScore: 10,
      questionCount: 10,
      date: "25/05/2026",
    },
    {
      id: "hist-2",
      title: "Luyện tập Liên kết câu trong văn bản",
      score: 9.0,
      totalScore: 10,
      questionCount: 10,
      date: "22/05/2026",
    },
  ]);

  const selectAnswer = useCallback(
    (questionId: string, optionKey: "A" | "B" | "C" | "D") => {
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: optionKey,
      }));
    },
    []
  );

  const handleQuizSubmit = useCallback(() => {
    let scoreCount = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        scoreCount++;
      }
    });

    const totalQuestions = quizQuestions.length || 1;
    const computedScore = parseFloat(
      ((scoreCount / totalQuestions) * 10).toFixed(1)
    );
    setCorrectCount(scoreCount);
    setFinalScore(computedScore);

    // Save to history list
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: `Luyện tập AI: ${SUBJECT_LABELS[selectedSubject]}`,
      score: computedScore,
      totalScore: 10,
      questionCount: quizQuestions.length,
      date: formattedDate,
    };

    setHistoryList((prev) => [newHistoryItem, ...prev]);
    setActiveScreen("result");
  }, [quizQuestions, userAnswers, selectedSubject]);

  // Timer logic for quiz
  useEffect(() => {
    if (activeScreen !== "quiz") return;

    if (timeLeft <= 0) {
      handleQuizSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, activeScreen, handleQuizSubmit]);

  const handleStartPractice = useCallback((subject?: "math" | "literature" | "english") => {
    const targetSubject = subject || selectedSubject;
    const questions = mockQuestionsData[targetSubject] || [];
    
    if (subject) {
      setSelectedSubject(subject);
    }
    
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(300); // 5 minutes
    setActiveScreen("quiz");
  }, [selectedSubject]);

  const quitPractice = useCallback(() => {
    setActiveScreen("config");
  }, []);

  return {
    activeScreen,
    setActiveScreen,
    selectedSubject,
    setSelectedSubject,
    difficulty,
    setDifficulty,
    questionCount,
    setQuestionCount,
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
  };
}
