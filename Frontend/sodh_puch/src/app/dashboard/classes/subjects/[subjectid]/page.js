"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function SubjectDetails({ params }) {
  const [subjectTopics, setSubjectTopics] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const router = useRouter();

  const subjectid = params?.subjectid;

  const handleTopicClick = (index) => {
    setSelectedTopicIndex(selectedTopicIndex === index ? null : index);
  };

  const openPopup = () => setShowPopup(true);

  const closePopup = () => {
    setShowPopup(false);
    setNewTopicName("");
  };

  const handleAddTopic = () => {
    if (newTopicName.trim()) {
      const newTopic = { quiz_topic: newTopicName };
      setSubjectTopics([...subjectTopics, newTopic]);
      closePopup();
    }
  };

  const handleDeleteTopic = (index) => {
    const updatedTopics = subjectTopics.filter((_, i) => i !== index);
    setSubjectTopics(updatedTopics);
  };

  const handleAddQuiz = () => {
    router.push("/dashboard/classes/addquiz");
  };

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
      {subjectTopics.map((topic, index) => (
        <div
          key={index}
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
      ))}

      {/* Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h2>Add New Chapter</h2>
            <input
              type="text"
              placeholder="Enter Chapter Name"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
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
