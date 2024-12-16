"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubjectDetails({ params }) {
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { subjectid } = params; // The ID passed in the URL

  const option = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch("http://localhost:8000/see_quiz_topic", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ quiz_class: subjectid })
        });

        if (!response.ok) throw new Error("Failed to fetch subject details");

        const data = await response.json();
        setSubjectDetails(data); // Update the state with fetched details
      } catch (error) {
        console.error("Error fetching subject details:", error);
        setError(error.message);
      }
    };

    fetchSubjectDetails();
  }, [subjectid]);

  if (error) return <div>Error: {error}</div>;
  if (!subjectDetails) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.heading}>
          {subjectDetails.quiz_class}
          <span className={styles.icon} onClick={option}>
            <BiDotsVerticalRounded />
          </span>
        </h2>
        <div className={`${styles.dropdown} ${open ? styles.show : ""}`}>
          <Link href="/dashboard/classes/addquiz" className={styles.add}>
            <span>Add Quiz</span>
          </Link>
          <Link href="/dashboard/classes/subjects" className={styles.add}>
            <span>Go Back</span>
          </Link>
        </div>
        <p className={styles.details}>{subjectDetails.description}</p>
      </div>
      <div className={styles.box}>
        <h3>Topic:</h3>
        <p>{subjectDetails.topic}</p>
      </div>
    </div>
  );
}
