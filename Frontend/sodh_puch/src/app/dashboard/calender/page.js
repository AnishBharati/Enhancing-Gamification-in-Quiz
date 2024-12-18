"use client";
import { useState } from "react";
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

export default function Calender() {
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

    const sortedStudents = [...students].sort((a, b) => b.marks - a.marks).slice(0, 5);

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
    };

    return (
        <div className={styles.container}>
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
                    {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                            {subject}
                        </option>
                    ))}
                </select>
            </div>

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
