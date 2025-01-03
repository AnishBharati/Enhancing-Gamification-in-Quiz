"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../../../../axiosSetup";

export default function SeeAskedQuestion() {
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [note, setNote] = useState(""); // State to hold note text
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0); // Added score state
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const classid = useSearchParams().get("classid");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `http://localhost:8000/see_ask_question?classId=${classid}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        const questionsData = data.seeQuestion || [];

        // Modify the fetched questions to include all necessary fields
        const fetchedQuestions = questionsData.map((question) => ({
          id: question.id,
          question: question.Question,
          option1: question.Option1,
          option2: question.Option2,
          option3: question.Option3,
          option4: question.Option4,
          asked_to: question.asked_to,
          classId: question.classId,
          correct_option: question.correct_option,
          note: question.note,
        }));

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [classid]);

  const handleButtonClicked = () => {
    setIsClicked(!isClicked);
    console.log("Button is clicked: ", isClicked);
  };

  const handleModalOpen = (index) => {
    setCurrentQuestionIndex(index);
    setIsModalOpen(true);
    setSelectedOption(null); // Reset selected option when opening a new question
    setNote(""); // Reset the note field
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value); // Update the note state
  };

  const handleSubmit = async (question) => {
    if (!selectedOption) return; // Prevent submission if no option is selected
    console.log(question.id);
    console.log(question.asked_to);
    console.log(classid);
    try {
      const response = await axios.put(
        "http://localhost:8000/update_ask_question",
        {
          id: question.id,
          askedto: question.asked_to, // This is now available from the fetched question
          correct_option: parseInt(selectedOption, 10), // Use the selected option directly
          classId: classid, // This is now available from the fetched question
          note: note, // Send the note data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data); // Handle the response if needed
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <div>
      <h1>See Asked Questions</h1>
      <div>
        {questions.length > 0 ? (
          questions.map((topic, index) => (
            <div key={topic.id}>
              <button onClick={() => handleModalOpen(index)}>
                {topic.question}
              </button>
            </div>
          ))
        ) : (
          <div>No any questions</div>
        )}
      </div>
      <div>
        <h1>your asked question:</h1>
        {questions.length > 0 ? (
          questions.map((topic, index) => (
            <div key={topic.id}>
              <button onClick={() => handleButtonClicked()}>
                {topic.question}
              </button>
              {isClicked && (
                <div>
                  <h2>{topic.question}</h2>
                  <h3>Options are: </h3>
                  <ul>{topic.option1}</ul>
                  <ul>{topic.option2}</ul>
                  <ul>{topic.option3}</ul>
                  <ul>{topic.option4}</ul>
                  {topic.correct_option == "1" && (
                    <ul>The correct answer is {topic.option1}</ul>
                  )}
                  {topic.correct_option == "2" && (
                    <ul>The correct answer is {topic.option2}</ul>
                  )}
                  {topic.correct_option == "3" && (
                    <ul>The correct answer is {topic.option3}</ul>
                  )}
                  {topic.correct_option == "4" && (
                    <ul>The correct answer is {topic.option4}</ul>
                  )}
                  {topic.correct_option == "" && (
                    <ul>The answer is not given</ul>
                  )}
                  <ul>{topic.note}</ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No any questions</div>
        )}
      </div>
      {isModalOpen && (
        <div>
          <h1 className={styles.title}>Quiz</h1>
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
              {["option1", "option2", "option3", "option4"].map((key, idx) => (
                <div key={idx} className={styles.option}>
                  <input
                    type="radio"
                    id={`option${idx + 1}`}
                    name="quizOption"
                    value={key}
                    className={styles.radio}
                    onChange={() => handleOptionChange(idx + 1)} // Store the index (1, 2, 3, 4)
                    checked={selectedOption === idx + 1}
                  />
                  <label htmlFor={`option${idx + 1}`} className={styles.label}>
                    {questions[currentQuestionIndex]?.[key]}
                  </label>
                </div>
              ))}
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
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
