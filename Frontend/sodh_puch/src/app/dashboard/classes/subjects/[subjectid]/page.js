"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SubjectDetails({ params }) {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [subjectTopics, setSubjectTopics] = useState([]); // State to store all topics
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Track which dropdown is open

  const searchParams = useSearchParams();
  const topic_id = searchParams.get("quiz_class"); // Retrieve query parameter

  // Log topic_id for debugging
  useEffect(() => {
    console.log("Topic ID being passed:", topic_id);
  }, [topic_id]);

  // Fetch stored topics and descriptions from localStorage
  useEffect(() => {
    const storedTopics = JSON.parse(localStorage.getItem("topics")) || [];
    const storedDescriptions =
      JSON.parse(localStorage.getItem("descriptions")) || [];
    setTopics(storedTopics);
    setDescriptions(storedDescriptions);

    // Fetch quiz topics based on topic_id
    if (topic_id) {
      fetchQuizTopics(topic_id);
    }
  }, [topic_id]);

  // Function to fetch quiz topics from the backend
  const fetchQuizTopics = async (topic_id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/see_topic?quiz_class=${topic_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token if needed
          },
        }
      );
      const data = await response.json();
      if (data.quiz_topics) {
        // Update state with the array of fetched quiz topics
        setSubjectTopics(data.quiz_topics);
      }
    } catch (error) {
      console.error("Error fetching quiz topics:", error);
    }
  };

  // Find the subject and its description from localStorage
  const subjectid = params?.subjectid;
  const subjectTopicFromLocalStorage = topics.find(
    (topic) => topic === subjectid
  );
  const subjectDescription = subjectTopicFromLocalStorage
    ? descriptions[topics.indexOf(subjectTopicFromLocalStorage)]
    : null;

  // Toggle dropdown for a specific topic
  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index); // Toggle dropdown for clicked topic
  };

  return (
    <div className={styles.container}>
      <div>
        {subjectTopics.length > 0 ? (
          subjectTopics.map((topic, index) => (
            <div key={index} className={styles.topicContainer}>
              {/* Each topic has its own block */}
              <h2 className={styles.heading}>
                {topic.quiz_topic} {/* Display individual topic */}
                <span
                  className={styles.icon}
                  onClick={() => handleDropdownToggle(index)} // Toggle the specific dropdown
                >
                  <BiDotsVerticalRounded />
                </span>
              </h2>

              <div
                className={`${styles.dropdown} ${
                  openDropdownIndex === index ? styles.show : "" // Show only the clicked dropdown
                }`}
              >
                <Link href="/dashboard/classes/addquiz" className={styles.add}>
                  <span>Add Quiz</span>
                </Link>
                <Link href="/dashboard/classes/subjects" className={styles.add}>
                  <span>Go Back</span>
                </Link>
              </div>

              <p className={styles.details}>{subjectDescription}</p>
            </div>
          ))
        ) : (
          <p>No topics available.</p>
        )}
      </div>
    </div>
  );
}
