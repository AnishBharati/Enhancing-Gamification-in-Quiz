"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../(auth)/auth";
import axios from "../../axiosSetup";

export default function Subjects() {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [code, setCode] = useState([]);
  const [teacherData, setTeacherData] = useState({}); // New state to store teacher data for each classId
  const [error, setError] = useState(null);

  const router = useRouter();

  const subjectImages = {
    Science: "/img/science.jpeg",
    Economics: "/img/Economics.jpeg",
    Computer: "/img/Computer.jpeg",
    English: "/img/English.jpeg",
    Nepali: "/img/Nepali.jpeg",
    Math: "/img/Math.jpeg",
  };

  const getSubjectImage = (quizClass) => {
    return subjectImages[quizClass] || "/img/default.jpg";
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await isAuthenticated())) {
        router.push("/pages/login"); // Fixed login path
      }
    };
    checkAuth();
  }, [router]);

  // Fetch teacher data for a given classId
  const fetchTeacherData = async (classId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/get_teacher?id=${classId}`
      );
      setTeacherData((prevData) => ({
        ...prevData,
        [classId]: {
          userId: response.data.userId,
          teacherId: response.data.data, // Assuming this is correct
        },
      }));
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
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
          quiz_class: task.quiz_class,
        }));

        const fetchedDescriptions = tasks.map((task) => task.description);
        const fetchedCode = tasks.map((task) => task.code);
        setTopics(fetchedTopics);
        setDescriptions(fetchedDescriptions);
        setCode(fetchedCode);

        // Fetch teacher data for each classId
        tasks.forEach((task) => {
          fetchTeacherData(task.id);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, []); // This effect is fine to run once at component mount

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
                  src={getSubjectImage(topic.quiz_class)}
                  alt={topic.quiz_class}
                />
              </div>
              <div className={styles.cardContent}>
                <h3>{topic.quiz_class}</h3>
                <p>{descriptions[index]}</p>
                <p>{code[index]}</p>
                <div className={styles.cardFooter}>
                  <Link
                    href={`/pages/subjects/${topic.id}?id=${
                      topic.id
                    }&class=${encodeURIComponent(topic.quiz_class)}`}
                  >
                    <button className={styles.viewButton}>View Details</button>
                  </Link>
                  {/* Check if teacherId matches userId to show the delete option */}
                  {teacherData[topic.id] &&
                    teacherData[topic.id].teacherId ==
                      teacherData[topic.id].userId && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(topic.id)}
                      >
                        Delete
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
