"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function AddClass() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const topics = JSON.parse(localStorage.getItem("topics")) || [];
    const descriptions = JSON.parse(localStorage.getItem("descriptions")) || [];


    topics.push(topic);
    descriptions.push(description);


    localStorage.setItem("topics", JSON.stringify(topics));
    localStorage.setItem("descriptions", JSON.stringify(descriptions));

    
    setTopic("");
    setDescription("");
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.container}>
        <h2 className={styles.title}>Add Class</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="topic" className={styles.label}>Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className={styles.textarea}
            />
          </div>
          <button type="submit" className={styles.button}>Submit</button>
        </form>
      </div>
    </div>
  );
}