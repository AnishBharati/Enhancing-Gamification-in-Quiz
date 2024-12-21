"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";
import axios from "../../../../axiosSetup";

export default function SubjectDetails() {
  const [topics, setTopics] = useState([]);  // Ensure it is initialized as an empty array
  const [showPopup, setShowPopup] = useState(false);
  const [quizTopic, setquizTopic] = useState("");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const router = useRouter();
  const params = useParams();  // Use `useParams()` to get params from the URL

  // Accessing subjectid from params
  const subjectid = params?.subjectid;

  // Handle topic click to toggle options (Add Quiz/Delete)
  const handleTopicClick = (index) => {
    setSelectedTopicIndex(selectedTopicIndex === index ? null : index);
  };

  // Open popup to add a new topic
  const openPopup = () => setShowPopup(true);

  // Close popup and reset state
  const closePopup = () => {
    setShowPopup(false);
  };

  // Handle adding a new topic
  const handleAddTopic = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8000/add_topic", { quizTopic, quizClass: subjectid })
      .then((res) => {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Assuming the response contains the newly added topic
        const newTopic = res.data.newTopic; // Adjust this based on your actual response
        setTopics((prevTopics) => [...prevTopics, newTopic]); // Add new topic to state

        setquizTopic(""); // Reset input field
        closePopup();
      })
      .catch((err) => {
        console.error("Error adding topic:", err);
      });
  };

  // Fetch existing topics from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(`http://localhost:8000/see_topic?quiz_class=${subjectid}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        const quizTopics = data.quiz_topics || []; // Ensure quiz_topics is always an array

        // Set the topics state with fetched data
        setTopics(quizTopics);
      } catch (error) {
        console.error("Error in fetching topics: ", error);
      }
    };

    fetchData();
  }, [subjectid]); // Re-fetch when subjectid changes

  // Handle deleting a topic
  const handleDeleteTopic = (index) => {
    
  };

  // Handle adding a quiz for a topic
  const handleAddQuiz = () => {
    router.push("/dashboard/classes/addquiz");
  };
console.log("Topics are ", topics);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => router.back()}>
        <IoIosArrowBack size={30} />
      </button>

      {/* Subject Header */}
      <div className={styles.subjectCard}>
        <div>
          <h1 className={styles.subjectName}>{subjectid}</h1>
          <p className={styles.subjectDescription}>Subject Description</p>
        </div>
        <div className={styles.addIcon} onClick={openPopup}>
          <IoMdAdd size={30} title="Add Chapter" />
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 ? (
        topics.map((topic, index) => (
          <div
            key={topic.id} // Use the unique `id` as the key
            className={styles.topicContainer}
            onClick={() => handleTopicClick(index)}
          >
            <h2 className={styles.heading}>{topic.quiz_topic}</h2>
            {selectedTopicIndex === index && (
              <div className={styles.topicOptions}>
                <button className={styles.addQuizButton} onClick={handleAddQuiz}>
                  Add Quiz
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown closure
                    handleDeleteTopic(index);
                  }}
                >
                  Delete Chapter
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No topics available.</p> // Message to show if no topics are present
      )}

      {/* Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h2>Add New Chapter</h2>
            <input
              type="text"
              placeholder="Enter Chapter Name"
              value={quizTopic}
              onChange={(e) => setquizTopic(e.target.value)}
              className={styles.inputField}
            />
            <div className={styles.buttonGroup}>
              <button onClick={handleAddTopic} className={styles.addButton}>
                Add
              </button>
              <button onClick={closePopup} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
