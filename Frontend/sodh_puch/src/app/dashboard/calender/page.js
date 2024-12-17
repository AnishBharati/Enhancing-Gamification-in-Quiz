"use client"
import styles from "./page.module.css";

const students = [
    { name: 'John Doe', marks: 95 },
    { name: 'Jane Smith', marks: 75 },
    { name: 'Bob Johnson', marks: 45 },
    { name: 'Alice Brown', marks: 20 },
    { name: 'Tom White', marks: 50 },
    { name: 'Tom shite', marks: 98 },
    { name: 'm White', marks: 99 },
];

export default function Calender() {
    const sortedStudents = [...students].sort((a, b) => b.marks - a.marks).slice(0, 5);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Student Marks</h2>
            <div className={styles.list}>
                {sortedStudents.map((student, index) => {
                    const category =
                        student.marks >= 85
                            ? styles.high
                            : student.marks >= 50
                            ? styles.average
                            : styles.low;

                    let rankClass = '';
                    if (index === 0) rankClass = styles.gold;
                    else if (index === 1) rankClass = styles.silver;
                    else if (index === 2) rankClass = styles.bronze;

                    return (
                        <div key={index} className={`${styles.student} ${category}`}>
                            <span className={`${styles.rank} ${rankClass}`}>{index + 1}</span>
                            <span className={styles.name}>{student.name}</span>
                            <span className={styles.marks}>{student.marks}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
