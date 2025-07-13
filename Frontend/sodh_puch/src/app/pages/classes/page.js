"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../(auth)/auth";
import { IoCloseOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import axios from "../../axiosSetup";
import AddClass from "./addClass/page.js";

export default function Classes() {
  const [modal, setModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await isAuthenticated())) {
        router.push("/pages/login");
      }
    };
    checkAuth();
  }, []);

  const toggleModal = () => {
    setModal((prev) => !prev);
  };

  const toggleJoinModal = () => {
    setJoinModal((prev) => !prev);
  };

  const handleSubmit = (e) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    e.preventDefault();
    axios
      .post(`${backendUrl}/add_student`, { code })
      .then((res) => {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
        }
        setCode("");
        router.push("/pages/subjects");
      })
      .catch((error) => {
        console.error("Error adding students: ", error);
      });
  };

  return (
    <div className={styles.container}>
      {/* Main Heading */}
      <div className={styles.heading}>
        <p>
          Join our daily quizzes and test your knowledge. Or you can create your
          own quiz and share it with the community.
        </p>
      </div>

      {/* Quiz Cards */}
      <div className={styles.cardContainer}>
        {/* Join Quiz Card */}
        <div className={styles.card}>
          <img
            src="/img/join-quiz.jpeg"
            alt="Join Quiz"
            className={styles.cardImage}
          />
          <h2>Join Quiz</h2>
          <p>Join our daily quizzes and challenge your knowledge.</p>
          <button className={styles.btn1} onClick={toggleJoinModal}>
            Join Quiz
          </button>
        </div>

        {/* Add Quiz Card */}
        <div className={styles.card}>
          <img
            src="/img/add-quiz.jpg"
            alt="Add Quiz"
            className={styles.cardImage}
          />
          <h2>Add Quiz</h2>
          <p>Create and share your own quiz with the community.</p>
          <button className={styles.btn2} onClick={toggleModal}>
            Add Quiz
          </button>
        </div>
      </div>

      {/* Join Quiz Modal */}
      {joinModal && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={toggleJoinModal}>
              <IoCloseOutline />
            </span>
            <h3>Join Quiz</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Quiz Modal */}
      {modal && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={toggleModal}>
              <IoCloseOutline />
            </span>
            <AddClass onClose={toggleModal} />
          </div>
        </div>
      )}
    </div>
  );
}
