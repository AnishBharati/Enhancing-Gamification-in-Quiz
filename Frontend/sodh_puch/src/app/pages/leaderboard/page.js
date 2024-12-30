"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const students = [
    { name: 'John Doe', marks: 95 },
    { name: 'Jane Smith', marks: 75 },
    { name: 'Bob Johnson', marks: 45 },
    { name: 'Alice Brown', marks: 20 },
    { name: 'Tom White', marks: 50 },
    { name: 'Tom Shite', marks: 98 },
    { name: 'M White', marks: 99 },
];

const subjects = ["Math", "Science", "Socials", "Other"];

export default function Calendar() {
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState(null);  // Added state for error handling

    const sortedStudents = [...students].sort((a, b) => b.marks - a.marks).slice(0, 5);

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
    };

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

    const handleOptionClick = async (id) => {
        // console.log("Id clicked is: ", id);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");
    
            const response = await fetch(`http://localhost:8000/get_leaderboard?id=${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // No need for Content-Type here because we're not sending a body
                },
            });
    
            // Check if the response is successful
            if (!response.ok) {
                throw new Error("Failed to fetch leaderboard");
            }
    
            const data = await response.json();
            console.log(data);  // Handle the response data here, e.g., updating the UI
            
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
                <label htmlFor="subjects">Select Subject:</label>
                <select
                    id="subjects"
                    value={selectedSubject}
                    onChange={handleSubjectChange}
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

            {/* Error Message */}
            {error && <div className={styles.error}>{error}</div>}

            {/* Student List */}
            <div className={styles.list}>
                {sortedStudents.map((student, index) => {
                    const category =
                        student.marks >= 85
                            ? styles.high
                            : student.marks >= 50
                            ? styles.average
                            : styles.low;

                    let trophy = '';
                    if (index === 0) trophy = '🏆'; // Gold Trophy
                    else if (index === 1) trophy = '🥈'; // Silver Medal
                    else if (index === 2) trophy = '🥉'; // Bronze Medal;

                    return (
                        <div key={index} className={`${styles.student} ${category}`}>
                            <span className={styles.trophy}>{trophy}</span>
                            <span className={styles.rank}>{index + 1}</span>
                            <span className={styles.name}>{student.name}</span>
                            <span className={styles.marks}>{student.marks}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
