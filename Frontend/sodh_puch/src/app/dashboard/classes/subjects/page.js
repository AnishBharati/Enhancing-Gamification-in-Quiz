"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../../(auth)/auth";
export default function Subjects() {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await isAuthenticated())) {
        router.push("/login");
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

        // Ensure each topic is an object containing both the id and quiz_class
        const fetchedTopics = tasks.map((task) => ({
          id: task.id, // Assuming id exists on the task object
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
        body: JSON.stringify({ id }), // Send the class id to delete
      });

      if (!response.ok) throw new Error("Failed to delete class");

      const data = await response.json();
      console.log(data.message); // Optionally handle the success response
      alert("Class deleted successfully!");
      // Optionally update the UI after deletion
      setTopics(topics.filter((topic) => topic.id !== id)); // Remove the deleted class from state
    } catch (error) {
      console.error("Error deleting class:", error.message);
      alert("Error deleting class: " + error.message);
    }
  };

  const handleCardClick = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  return (
    <div className={styles.maincontainer}>
      {error ? (
        <p>Error: {error}</p>
      ) : topics.length === 0 ? (
        <p>No topics added yet.</p>
      ) : (
        topics.map((topic, index) => (
          <div
            className={styles.card}
            key={topic.id} // Use the topic's id as the key
            onClick={() => handleCardClick(index)}
          >
            <div>
              <h3 className={styles.item1}>{topic.quiz_class}</h3>
              <p className={styles.item2}>{descriptions[index]}</p>
            </div>
            {selectedIndex === index && (
              <div className={styles.cardOptions}>
                <Link
                  href={`/dashboard/classes/subjects/quiz_class?quiz_class=${topic.id}`}
                >
                  <button>View the Subject</button>
                </Link>
                <button onClick={() => handleDelete(topic.id)}>
                  Delete the Subject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
