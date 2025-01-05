"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import axios from "../../../../axiosSetup";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ViewQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [token, setToken] = useState(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0.3 * 60); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const classid = searchParams.get("classid");
  const router = useRouter();

  // Load token from localStorage on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Fetch quiz questions from backend
      axios
        .post(
          "http://localhost:8000/see_quiz",
          { quizTopicID: id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.data.questions) {
            setQuestions(response.data.questions);
          }
        })
        .catch((error) => console.error("Error fetching quiz:", error));
    }
  }, [token, id]);

  // Timer logic to count down the time
  useEffect(() => {
    // Only start the timer if it's active and timeLeft is greater than 0
    if (timerActive && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          // Check if timeLeft is greater than 0 before decrementing
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerId); // Stop the timer when it reaches 0
            return 0;
          }
        });
      }, 1000);

      // Cleanup the interval on component unmount or when the timer stops
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      // When timer runs out, end the quiz
      handleFinalSubmit();
    }
  }, [timeLeft, timerActive]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];

    // Send the answer to the backend and update the score
    axios
      .post(
        "http://localhost:8000/check",
        {
          quizTopicID: id,
          question_id: currentQuestion.id,
          selected_option: parseInt(selectedOption, 10), // Convert to a number
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const { marks } = response.data;
        if (marks) setScore((prevScore) => prevScore + marks);

        // Move to next question only if it's not the last one
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
        } else {
          setQuizCompleted(true); // End the quiz if it's the last question
        }
      })
      .catch((error) => console.error("Error submitting answer:", error));
  };

  const handleFinalSubmit = () => {
    setQuizCompleted(true); // Mark quiz as completed
    setTimerActive(false); // Stop the timer
    setShowCompletionMessage(true);
    setTimeout(() => {
      router.push("/pages/subjects");
    }, 3000);
    setSuccessMessage(true);

    // Hide the success message after 2 seconds
    setTimeout(() => {
      setSuccessMessage(false);
    }, 2000); // Mark quiz as completed
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  if (!token) return <p>Loading...</p>;
  if (questions.length === 0) return <p>Loading quiz...</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      {!showCompletionMessage ? (
        <>
          <h1 className={styles.title}>Quiz</h1>
          <div className={styles.timer}>
            {/* Display the timer */}
            <p>Time Left: {formatTime(timeLeft)}</p>
          </div>
          <div className={styles.quizContainer}>
            <div className={styles.field}>
              {/* Display current question number and total questions */}
              <p className={styles.questionNumber}>
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>
              <h2 className={styles.question} style={{ userSelect: "none" }}>
                {currentQuestion.question}
              </h2>
            </div>
            <div className={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className={styles.option}>
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="quizOption"
                    value={index + 1} // Assign a numeric value (1, 2, 3, 4)
                    onChange={handleOptionChange}
                    className={styles.radio}
                    checked={parseInt(selectedOption, 10) === index + 1} // Match numeric values
                  />
                  <label
                    htmlFor={`option-${index}`}
                    className={styles.label}
                    style={{ userSelect: "none" }}
                  >
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
        </>
      ) : (
        successMessage && (
          <div className={styles.successPopupOverlay}>
            <div className={styles.successPopup}>
              <p className={styles.completionMessage}>
              🎉 Congratulations!🥳  You've completed all quizzes!  🎉
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
