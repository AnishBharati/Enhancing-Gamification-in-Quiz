"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../../../../axiosSetup";
import { IoIosArrowBack } from "react-icons/io";

export default function SeeAskedQuestion() {
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [note, setNote] = useState("");
  const [isClicked, setIsClicked] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const router = useRouter();
  const classid = useSearchParams().get("classid");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchQuestions = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
        const response = await axios.get(
          `${backendUrl}/see_ask_question?classId=${classid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const questionsData = response.data.seeQuestion || [];
        setQuestions(
          questionsData.map((q) => ({
            id: q.id,
            question: q.Question,
            option1: q.Option1,
            option2: q.Option2,
            option3: q.Option3,
            option4: q.Option4,
            asked_to: q.asked_to,
            correct_option: q.correct_option,
            note: q.note,
            asked_by: q.asked_by,
            userId: q.userId,
          }))
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (token) fetchQuestions();
  }, [classid, token]);

  const handleModalOpen = (index) => {
    setCurrentQuestionIndex(index);
    setIsModalOpen(true);
    setSelectedOption(null);
    setNote("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
    setNote("");
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value);
  };

  const handleAskQuestionDelete = (id) => {
    const userConfirmed = window.confirm(
      "Are you sure do you want to delete question?"
    );

    if (!userConfirmed) {
      return;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    axios
      .delete(`${backendUrl}/delete_ask_question`, {
        data: {
          id: id,
          classId: classid,
        },
      })
      .then(() => {
        setSuccessMessage(true);

        // Hide the success message after 1.5 seconds
        setTimeout(() => {
          setSuccessMessage(false);
        }, 2000);
        router.push("/pages/subjects");
      })
      .catch((err) => {
        console.error("Error deleting question:", err);
      });
  };

  const handleSubmit = async (question) => {
    if (!selectedOption) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      await axios.put(
        `${backendUrl}/update_ask_question`,
        {
          id: question.id,
          correct_option: parseInt(selectedOption, 10),
          classId: classid,
          note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      handleModalClose();
      window.location.reload();
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleButtonClicked = (index) => {
    setIsClicked((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.top}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <IoIosArrowBack size={30} />
          </button>
        </div>
        <div className={styles.ui}>
          <h1 className={styles.h1}>See Asked Questions</h1>
          <div>
            <div>
              {questions.length > 0 ? (
                questions.map((topic, index) => (
                  <div key={topic.id}>
                    {topic.correct_option == null &&
                      topic.asked_to == topic.userId && (
                        <button
                          className={styles.questionButton}
                          onClick={() => handleModalOpen(index)}
                        >
                          {topic.question}
                        </button>
                      )}
                  </div>
                ))
              ) : (
                <div>No questions available</div>
              )}
            </div>
          </div>

          {isModalOpen && (
            <div className={styles.quizContainer}>
              <div className={styles.field}>
                <p className={styles.questionNumber}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <h2 className={styles.question}>
                  {questions[currentQuestionIndex]?.question}
                </h2>
              </div>

              <div className={styles.optionsContainer}>
                {["option1", "option2", "option3", "option4"].map(
                  (key, idx) => (
                    <div key={idx} className={styles.option}>
                      <input
                        type="radio"
                        id={`option${idx + 1}`}
                        name="quizOption"
                        value={key}
                        className={styles.radio}
                        onChange={() => handleOptionChange(idx + 1)}
                        checked={selectedOption === idx + 1}
                      />
                      <label
                        htmlFor={`option${idx + 1}`}
                        className={styles.label}
                      >
                        {questions[currentQuestionIndex]?.[key]}
                      </label>
                    </div>
                  )
                )}
              </div>

              <div className={styles.noteContainer}>
                <label htmlFor="note" className={styles.label}>
                  Add a note:
                </label>
                <textarea
                  id="note"
                  className={styles.textarea}
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Write a note for this question"
                />
              </div>

              <div className={styles.submitContainer}>
                <button
                  className={styles.submitButton}
                  onClick={() => handleSubmit(questions[currentQuestionIndex])}
                  disabled={selectedOption === null}
                >
                  Submit
                </button>
                <button
                  className={styles.closeButton}
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.ui}>
          <h1>Your Asked Questions:</h1>
          <div className={styles.questionCard}>
            {questions.length > 0 ? (
              questions.map((topic, index) => (
                <div key={topic.id} className={styles.questionCard}>
                  {topic.correct_option != null &&
                    topic.asked_by == topic.userId && (
                      <div>
                        <button
                          className={styles.questionButton}
                          onClick={() => handleButtonClicked(index)}
                        >
                          {topic.question}
                          {/* Question {currentQuestionIndex + 1}:{" "}
                          {questions[currentQuestionIndex]?.question}? */}
                        </button>
                        {isClicked === index && (
                          <div className={styles.questionDetails}>
                            <h2>{topic.question}</h2>
                            <h3>Options are:</h3>
                            <div className={styles.optionsList}>
                              <ul className={styles.optionItem}>
                                {topic.option1}
                              </ul>
                              <ul className={styles.optionItem}>
                                {topic.option2}
                              </ul>
                              <ul className={styles.optionItem}>
                                {topic.option3}
                              </ul>
                              <ul className={styles.optionItem}>
                                {topic.option4}
                              </ul>
                            </div>
                            <div className={styles.answerSection}>
                              <h3>Correct Answer:</h3>
                              <p>
                                {topic.correct_option == 1
                                  ? `The correct answer is ${topic.option1}`
                                  : topic.correct_option == 2
                                  ? `The correct answer is ${topic.option2}`
                                  : topic.correct_option == 3
                                  ? `The correct answer is ${topic.option3}`
                                  : topic.correct_option == 4
                                  ? `The correct answer is ${topic.option4}`
                                  : "No correct option available"}
                              </p>
                            </div>
                            <div>
                              {topic.asked_by == topic.userId && (
                                <button
                                  onClick={() =>
                                    handleAskQuestionDelete(topic.id)
                                  }
                                  className={styles.closeButton}
                                >
                                  Delete Question
                                </button>
                              )}
                            </div>

                            <div className={styles.noteSection}>
                              <h3>Note:</h3>
                              <p>{topic.note}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div>No questions available</div>
            )}
          </div>
        </div>
      </div>
      {successMessage && (
        <div className={styles.successPopupOverlay}>
          <div className={styles.successPopup}>
            <h3>Success!</h3>
            <p>Your question is deleted successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
