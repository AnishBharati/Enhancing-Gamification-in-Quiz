"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Students() {
    const students = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
    ];

    const handleAskQuestion = (studentName) => {
        alert(`You are asking a question to ${studentName}`);
        // Replace with a modal or navigation to a form
    };

    return (
        <div className={styles.containeer}>
            <h1>Student List</h1>
            <ul className={styles.list}>
                {students.map((student) => (
                    <li key={student.id} className={styles.item}>
                        <span>{student.name}</span>
                        <button
                            onClick={() => handleAskQuestion(student.name)}
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
