"use client";
import { useState } from "react";
import styles from "./page.module.css"; 

export default function AddClass() {
    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Topic:", topic);
        console.log("Description:", description);
        setTopic("");
        setDescription(""); 
    };

    return (
        <div className={styles.maincontainer}>
            <div className={styles.container}>
                <h2 className={styles.title}>Add Class</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="topic" className={styles.label}>
                            Topic:
                        </label>
                        <input
                            type="text"
                            id="topic"
                            placeholder="Enter the topic"
                            required 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="description" className={styles.label}>
                            Description:
                        </label>
                        <textarea
                            id="description"
                            placeholder="Enter the description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textarea}
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
