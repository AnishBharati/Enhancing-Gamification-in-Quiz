"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function ViewQuiz() {
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
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    const selectedOptionIndex =
      quizDataList[currentQuizIndex].options.indexOf(selectedOption) + 1;
    console.log(`Option ${selectedOptionIndex} was clicked and submitted`);

    if (selectedOption === quizDataList[currentQuizIndex].correctAnswer) {
      const correctAnswerMessage = "Correct!!";
      console.log(correctAnswerMessage);
      // setMessage("Correct!");
      setScore((prevScore) => prevScore + 1); // Increment score for correct answer
    } else {
      const wrongAnswerMessage =
        "Wrong answer. The correct answer was: " +
        quizDataList[currentQuizIndex].correctAnswer;
      console.log(wrongAnswerMessage);
      // setMessage(
      //   "Wrong answer. The correct answer was: " +
      //     quizDataList[currentQuizIndex].correctAnswer
      // );
    }

    if (currentQuizIndex < quizDataList.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      console.log("You've completed all the quizzes!");
    }
  };

  const handleFinalSubmit = () => {
    console.log(`Final score: ${score}`);
    alert(`Your total score is: ${score} out of ${quizDataList.length}`);
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
          {!quizCompleted && (
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit
            </button>
          )}
          {quizCompleted && (
            <button
              className={styles.finalSubmitButton}
              onClick={handleFinalSubmit}
            >
              🚀 Final Submit
            </button>
          )}
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
