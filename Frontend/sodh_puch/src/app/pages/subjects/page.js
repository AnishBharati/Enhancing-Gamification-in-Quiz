"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../(auth)/auth";

export default function Subjects() {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  // const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Mapping of subjects to their specific image URLs
  const subjectImages = {
    Science: "/img/science.jpeg",
    Economics: "/img/Economics.jpeg",
    Computer: "/img/Computer.jpeg",
    English: "/img/English.jpeg",
    Nepali: "/img/Nepali.jpeg",
    Math: "/img/Math.jpeg", // Add other subjects as needed
  };

  const getSubjectImage = (quizClass) => {
    return subjectImages[quizClass] || "/img/default.jpg";
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await isAuthenticated())) {
        router.push("/pages/login");
      }
    };
    checkAuth();
  }, [router]);

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
          quiz_class: task.quiz_class,
        }));

        const fetchedDescriptions = tasks.map((task) => task.description);

        setTopics(fetchedTopics);
        setDescriptions(fetchedDescriptions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch("http://localhost:8000/delete_class", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete class");

      alert("Class deleted successfully!");
      setTopics(topics.filter((topic) => topic.id !== id));
    } catch (error) {
      console.error("Error deleting class:", error.message);
      alert("Error deleting class: " + error.message);
    }
  };

  // const handleCardClick = (index) => {
  //   setSelectedIndex(selectedIndex === index ? null : index);
  // };

  return (
    <div className={styles.maincontainer}>
      <h1 className={styles.header}>Topics</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : topics.length === 0 ? (
        <p>No topics added yet.</p>
      ) : (
        <div className={styles.subjectContainer}>
          {topics.map((topic, index) => (
            <div key={topic.id} className={styles.subjectCard}>
              <div className={styles.cardImage}>
                <img
                  src={getSubjectImage(topic.quiz_class)} // Use subject-specific images
                  alt={topic.quiz_class}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{topic.quiz_class}</h3>
                <p>{descriptions[index]}</p>
                <div className={styles.cardFooter}>
                <Link href={`/pages/subjects/${topic.id}?id=${topic.id}`}>
                  <button className={styles.viewButton}>View Details</button>
                </Link>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(topic.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
