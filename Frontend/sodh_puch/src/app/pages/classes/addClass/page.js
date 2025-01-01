import React, { useState } from "react";
import styles from "./page.module.css"; // Adjust the path as necessary
import axios from "../../../axiosSetup";
import { useRouter } from "next/navigation";
import { IoCloseOutline } from "react-icons/io5";

export default function AddClass({ onClose }) {
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
        setTopic("");
        setDescription("");
        router.push("/pages/classes/subjects");
      })
      .catch((error) => {
        console.error("Error adding class: ", error);
      });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>
          <IoCloseOutline />
        </span>
        <h3>Add Quiz</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter Topic"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
            rows="4"
            className={styles.textarea}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}