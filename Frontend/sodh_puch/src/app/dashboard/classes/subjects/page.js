"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function Subjects() {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const storedTopics = JSON.parse(localStorage.getItem("topics")) || [];
    const storedDescriptions =JSON.parse(localStorage.getItem("descriptions")) || [];
    setTopics(storedTopics);
    setDescriptions(storedDescriptions);
  }, []);

  const handleDelete = (index) => {
    const updatedTopics = [...topics];
    const updatedDescriptions = [...descriptions];
    updatedTopics.splice(index, 1);
    updatedDescriptions.splice(index, 1);

    localStorage.setItem("topics", JSON.stringify(updatedTopics));
    localStorage.setItem("descriptions", JSON.stringify(updatedDescriptions));

    setTopics(updatedTopics);
    setDescriptions(updatedDescriptions);
    setSelectedIndex(null);
  };

  const handleCardClick = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  return (
    <div className={styles.maincontainer}>
     <h1 className={styles.h1}>Subjects</h1> 
      {topics.length === 0 ? (
        <p>No topics added yet.</p>
      ) : (
        topics.map((topic, index) => (
          <div
            className={styles.card}
            key={index}
            onClick={() => handleCardClick(index)}
          >
            <div>
              
              <h3 className={styles.item1}>{topic}</h3>
              <p className={styles.item2}>{descriptions[index]}</p>
            </div>

            {selectedIndex === index && (
              <div className={styles.cardOptions}>
               <Link href={`/dashboard/classes/subjects/${topic}`}>
               <button>  View the Subject </button>
               </Link>
                <button onClick={() => handleDelete(index)}>
                  Delete the Subject{" "}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
