"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Calendar() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null); // Added state for error handling
  const [studentName, setStudentName] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch("http://localhost:8000/see_class", {
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

  const handleOptionClick = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `http://localhost:8000/get_leaderboard?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to fetch leaderboard";
        throw new Error(errorMessage); // Throw the message from the response
      }

      const data = await response.json();
      const studentDetails = data.userDetails || [];
      console.log("Data is", data);
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
      <h2 className={styles.title}>Student Marks</h2>

      {/* Dropdown for Subject Selection */}
      <div className={styles.dropdown}>
        <p className={styles.sub} htmlFor="subjects">Select Subject:</p>
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

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Student List */}
      <div className={styles.list}>
        {studentName
          .sort((a, b) => b.exp_points - a.exp_points) // Sort students by exp_points in descending order
          .slice(0, 5) // Get top 5 students
          .map((student, index) => {
            let trophy = "";
            if (index === 0) trophy = "🏆"; // Gold Trophy for 1st
            else if (index === 1) trophy = "🥈"; // Silver Medal for 2nd
            else if (index === 2) trophy = "🥉"; // Bronze Medal for 3rd

            // Set category based on exp_points
            const category =
              student.exp_points >= 85
                ? styles.high
                : student.exp_points >= 50
                ? styles.average
                : styles.low;

            return (
              <div key={student.id} className={`${styles.student} ${category}`}>
                <span className={styles.trophy}>{trophy}</span>
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.name}>{student.full_name}</span>
                <span className={styles.marks}>{student.exp_points}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
