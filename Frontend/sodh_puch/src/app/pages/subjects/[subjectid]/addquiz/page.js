"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { FiPlusCircle, FiX } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../../../../axiosSetup";

export default function AddQuiz() {
  const [Question, setQuestion] = useState("");
  const [correct_option, setCorrectanswer] = useState("");
  const [Option1, setOption1] = useState("");
  const [Option2, setOption2] = useState("");
  const [Option3, setOption3] = useState("");
  const [Option4, setOption4] = useState("");
  const [classId, setClassId] = useState("8"); // Default classId as 8
  const [quiz_topic, setQuizTopic] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]); // State to store fetched questions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(""); // For error handling
  const router = useRouter();
  const searchParams = useSearchParams(); // Access query params
  const [successMessage, setSuccessMessage] = useState(false);

  const topic = searchParams.get("class");
  const id = searchParams.get("id");
  const classid = useSearchParams().get("classid");

  useEffect(() => {
    if (topic) {
      setQuizTopic(topic.toUpperCase()); // Set quiz_topic to topic in uppercase
    }
    setClassId(id); // Default classId
  }, [topic]);

  // Fetch quiz questions on component load
  useEffect(() => {
    if (id) {
      axios
        .post("http://localhost:8000/see_quiz", { quizTopicID: id })
        .then((response) => {
          setQuizQuestions(response.data.questions || []);
        })
        .catch((err) => {
          setError("Failed to fetch quiz questions");
          console.error(err);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/add_question", {
        quiz_topic: id,
        Question,
        correct_option,
        Option1,
        Option2,
        Option3,
        Option4,
        correct_option,
        classId: classid,
      })
      .then((res) => {
        console.log(res);
        window.location.reload(); // Reload the current page

        // Reset input fields
        setQuestion("");
        setCorrectanswer("");
        setOption1("");
        setOption2("");
        setOption3("");
        setOption4("");
      })
      .catch((err) => console.log(err));

    // Close modal
    // setIsModalOpen(false);
  };
  const handleDeleteQuestion = (id, e) => {
    e.preventDefault();
    console.log("Deleting ID: ", id);
    const userConfirmed = window.confirm(
      "Are you sure do you want to delete this question?"
    );
    if (!userConfirmed) {
      return; // Exit if the user selects "Cancel"
    }
    axios
      .delete("http://localhost:8000/delete_question", {
        data: { question_id: id },
      })
      .then((res) => {
        console.log(res);
        setSuccessMessage(true);

        // Hide the success message after 1.5 seconds
        setTimeout(() => {
          setSuccessMessage(false);
        }, 2000);
        window.location.reload(); // Reload the current page // Redirect after successful deletion
      })
      .catch((error) => {
        console.error("Error in deleting question:", error);
      });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      {" "}
      <h1 className={styles.title}>Quiz Topic: {quiz_topic}</h1>
      <h1 className={styles.title}>
        CREATE QUIZ{" "}
        <button onClick={toggleModal} className={styles.icon}>
          <FiPlusCircle />
        </button>
      </h1>
      {/* Modal for adding new questions */}
      {isModalOpen && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <button className={styles.close} onClick={toggleModal}>
              <FiX />
            </button>
            <form action="" onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="Question" className={styles.label}>
                  Type a Question:
                </label>
                <input
                  className={styles.input}
                  type="text"
                  id="Question"
                  placeholder="Your Question"
                  required
                  value={Question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="correct_option">
                  Correct Answer:
                </label>
                <input
                  className={styles.input}
                  type="text"
                  id="correct_option"
                  placeholder="Correct Answer"
                  required
                  value={correct_option}
                  onChange={(e) => setCorrectanswer(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="Option1" className={styles.label}>
                  Write options for your Question:
                </label>
                <div className={styles.option}>
                  <input
                    className={styles.input}
                    type="text"
                    id="Option1"
                    placeholder="Option 1"
                    required
                    value={Option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    id="Option2"
                    placeholder="Option 2"
                    required
                    value={Option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                </div>
                <div className={styles.option}>
                  <input
                    className={styles.input}
                    type="text"
                    id="Option3"
                    placeholder="Option 3"
                    required
                    value={Option3}
                    onChange={(e) => setOption3(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    id="Option4"
                    placeholder="Option 4"
                    required
                    value={Option4}
                    onChange={(e) => setOption4(e.target.value)}
                  />
                </div>
              </div>
              <button className={styles.button} type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Error message */}
      {error && <p className={styles.error}>{error}</p>}
      {/* Displaying fetched quiz questions */}
      <div className={styles.quizContainer}>
        {quizQuestions.map((question, index) => (
          <div key={index} className={styles.questionCard}>
            <p className={styles.question}>{question.question}</p>
            <ul className={styles.options}>
              {question.options.map((option, idx) => (
                <li key={idx}>{option}</li>
              ))}
            </ul>
            {/* Pass the question's id to the delete handler */}
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown closure
                handleDeleteQuestion(question.id, e); // Pass the correct `id` here
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {successMessage && (
        <div className={styles.successPopupOverlay}>
          <div className={styles.successPopup}>
            <h3>Success!</h3>
            <p>Question is deleted Successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
}
