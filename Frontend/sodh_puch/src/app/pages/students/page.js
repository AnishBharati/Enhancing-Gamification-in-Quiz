"use client";
import { FiPlusCircle, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "../../axiosSetup";

export default function Students() {
  const [question, setQuestion] = useState("");
  const [correctanswer, setCorrectanswer] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Question:", question);
    console.log("CorrectAnswer:", correctanswer);
    console.log("Option1:", option1);
    console.log("Option2:", option2);
    console.log("Option3:", option3);
    console.log("Option4:", option4);

    // Clear fields
    setQuestion("");
    setCorrectanswer("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");

    // Close modal
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const students = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null); // Added state for error handling
  const [studentName, setStudentName] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(`${backendUrl}/see_class`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        const tasks = data.tasks || [];

        const fetchedTopics = tasks.map((task) => ({
          id: task.id,
          quiz_class: task.quiz_class, // Use quiz_class for the value
        }));

        setTopics(fetchedTopics); // Set the fetched topics
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message); // Set the error message if failed
      }
    };

    fetchData();
  }, []);

  const handleModalOpen = (askedtoid) => {
    setIsModalOpen(true);
    setStudentId(askedtoid);
    console.log("Student id: ", studentId);
  };
  const handleAskQuestion = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    axios
      .post(`${backendUrl}/add_ask_question`, {
        askedto: studentId,
        Question: question,
        Option1: option1,
        Option2: option2,
        Option3: option3,
        Option4: option4,
        classId: classId,
      })
      .then((res) => {
        console.log(res);

        setQuestion("");
        setOption1("");
        setOption2("");
        setOption3("");
        setOption4("");
      })
      .catch((err) => console.log(err));

    setIsModalOpen(false);
  };
  const handleOptionClick = async (id) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${backendUrl}/get_people_details?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClassId(id);
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to fetch leaderboard";
        throw new Error(errorMessage); // Throw the message from the response
      }

      const data = await response.json();
      const studentDetails = data.userDetails || [];

      // setStudentName(studentDetails);
      const parsedStudentDetails = studentDetails.map((student) => ({
        ...student,
        exp_points: Number(student.exp_points), // Ensure exp_points is treated as a number
      }));

      setStudentName(parsedStudentDetails);
      console.log("Students are: ", data.userDetails);
    } catch (error) {
      console.error("Error Showing Leaderboard:", error.message);
      alert("Error in Showing LeaderBoard: " + error.message);
    }
  };

  return (
    <div className={styles.containeer}>
      <h1>Student List</h1>
      <div className={styles.dropdown}>
        <label htmlFor="subjects">Select Subject:</label>
        <select id="subjects" className={styles.select}>
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <option
                key={index}
                value={topic.quiz_class}
                onClick={() => handleOptionClick(topic.id)}
              >
                {topic.quiz_class}
              </option>
            ))
          ) : (
            <option disabled>No topics available</option> // Show a placeholder if topics are empty
          )}
        </select>
      </div>
      <ul className={styles.list}>
        {studentName.map((student) => (
          <li key={student.id} className={styles.item}>
            <span>{student.full_name}</span>
            <button
              onClick={() => handleModalOpen(student.id)}
              className={styles.ask}
            >
              Ask a Question
            </button>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <button className={styles.close} onClick={toggleModal}>
              <FiX />
            </button>
            <form
              action="    transition: transform 0.3s, box-shadow 0.3s;
"
              onSubmit={handleSubmit}
              className={styles.form}
            >
              <div className={styles.field}>
                <label htmlFor="question" className={styles.label}>
                  Type Your Question:
                </label>
                <input
                  className={styles.input}
                  type="text"
                  id="question"
                  placeholder="Your Question"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className={styles.field}></div>
              <div className={styles.field}>
                <label htmlFor="option1" className={styles.label}>
                  Write options for your question:
                </label>
                <div className={styles.option}>
                  <input
                    className={styles.input}
                    type="text"
                    id="option1"
                    placeholder="Option 1"
                    required
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    id="option2"
                    placeholder="Option 2"
                    required
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                </div>
                <div className={styles.option}>
                  <input
                    className={styles.input}
                    type="text"
                    id="option3"
                    placeholder="Option 3"
                    required
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    id="option4"
                    placeholder="Option 4"
                    required
                    value={option4}
                    onChange={(e) => setOption4(e.target.value)}
                  />
                </div>
              </div>
              <button
                className={styles.button}
                onClick={handleAskQuestion}
                type="submit"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
