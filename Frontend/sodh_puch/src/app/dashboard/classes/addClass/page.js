"use client";
import { useState } from "react";
import styles from "./page.module.css";
import axios from "../../../axiosSetup";
import { useRouter } from "next/navigation";
export default function AddClass() {



  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();
  const handleSubmit = (e) => {

    e.preventDefault();

    axios
    .post("http://localhost:8000/add_class", { topic, description })
    .then((res) => {
      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      setTopic('');
      setDescription('');
      router.push("/dashboard/classes/subjects");
    })
    .catch((error) => {
      console.error("Error adding class: ", error);
    });
  
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
          <button type="submit"  className={styles.button}>Submit</button>
        </form>
      </div>
    </div>
  );
}