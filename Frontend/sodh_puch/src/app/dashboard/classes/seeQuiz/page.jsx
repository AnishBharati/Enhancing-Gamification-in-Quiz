"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function ViewQuiz() {
  // Sample quiz data – you can replace this with real data fetched from a server or state.
  const quizDataList = [
    {
      question: "What is the capital of France?",
      correctAnswer: "Paris",
      options: ["London", "Paris", "Berlin", "Madrid"],
    },
    {
      question: "What is 2 + 2?",
      correctAnswer: "4",
      options: ["1", "2", "3", "4"],
    },
    {
      question: "Which planet is closest to the Sun?",
      correctAnswer: "Mercury",
      options: ["Venus", "Earth", "Mars", "Mercury"],
    },
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [message, setMessage] = useState(""); // Message for feedback

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedOption === quizDataList[currentQuizIndex].correctAnswer) {
      setMessage("Correct!"); // Show success message
    } else {
      setMessage(
        "Wrong answer. The correct answer was: " +
          quizDataList[currentQuizIndex].correctAnswer
      );
    }

    // Go to the next quiz after submission
    if (currentQuizIndex < quizDataList.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      setMessage("You've completed all the quizzes!"); // Final completion message
    }
  };

  const currentQuiz = quizDataList[currentQuizIndex];

  return (
    <div>
      <h1 className={styles.title}>Quiz</h1>
      <div className={styles.quizContainer}>
        <div className={styles.field}>
          <h2 className={styles.question}>{currentQuiz.question}</h2>
        </div>
        <div className={styles.optionsContainer}>
          {currentQuiz.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="radio"
                id={`option-${index}`}
                name="quizOption"
                value={option}
                onChange={handleOptionChange}
                className={styles.radio}
                checked={selectedOption === option}
              />
              <label htmlFor={`option-${index}`} className={styles.label}>
                {option}
              </label>
            </div>
          ))}
        </div>
        <div className={styles.submitContainer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit
          </button>
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {quizCompleted && (
        <p className={styles.completionMessage}>
          You've completed all quizzes!
        </p>
      )}
    </div>
  );
}
