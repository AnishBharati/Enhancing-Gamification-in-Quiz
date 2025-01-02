"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Students() {
    const students = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
    ];

    const [topics, setTopics] = useState([]);
    const [error, setError] = useState(null);  // Added state for error handling
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
                        quiz_class: task.quiz_class,  // Use quiz_class for the value
                    }));
    
                    setTopics(fetchedTopics);  // Set the fetched topics
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setError(error.message);  // Set the error message if failed
                }
            };
    
            fetchData();
        }, []);

    const handleAskQuestion = (studentName) => {
        alert(`You are asking a question to ${studentName}`);
    };

    const handleOptionClick = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");
            
            const response = await fetch(`http://localhost:8000/get_leaderboard?id=${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            // Check if the response is successful
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || "Failed to fetch leaderboard";
                throw new Error(errorMessage);  // Throw the message from the response
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
                <select
                    id="subjects"
                    className={styles.select}
                >
                    {topics.length > 0 ? (
                        topics.map((topic, index) => (
                            <option key={index} value={topic.quiz_class} onClick={() => handleOptionClick(topic.id)}>
                                {topic.quiz_class}
                            </option>
                        ))
                    ) : (
                        <option disabled>No topics available</option>  // Show a placeholder if topics are empty
                    )}
                </select>
            </div>
            <ul className={styles.list}>
                {studentName.map((student) => (
                    <li key={student.id} className={styles.item}>
                        <span>{student.full_name}</span>
                        <button
                            onClick={() => handleAskQuestion(student.id)}
                            className={styles.ask}
                        >
                            Ask a Question
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
