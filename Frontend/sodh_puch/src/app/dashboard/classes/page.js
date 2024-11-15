"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../../(auth)/auth";
import { IoCloseOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import axios from "../../axiosSetup"
import AddClass from "./addClass/page.js";

export default function Classes() {
  const [modal, setModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [code, setCode] = useState(""); // Initialize code as an empty string
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!(await isAuthenticated())) {
        router.push('/login');
      }
    };
    checkAuth();
  }, []); // Removed router dependency if not necessary

  const toggleModal = () => {
    setModal((prev) => !prev);
  };

  const toggleJoinModal = () => {
    setJoinModal((prev) => !prev);
  };

  const handleSubmit = (e) => {

      e.preventDefault();
  
      axios
      .post("http://localhost:8000/add_student", { code })
      .then((res) => {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
        }
        setCode('');
        router.push("/dashboard/classes/subjects");
      })
      .catch((error) => {
        console.error("Error adding students: ", error);
      });
      };
  

  return (
    <div className={styles.container}>
      <div className={styles.container1}>
        <span>
          Design your first Quiz or Join
          <br />
        </span>
        <span>
          Make your own question bank and solve!
          <br />
          It’s quick and easy!
        </span>
      </div>

      <div className={styles.container2}>
        <button className={styles.btn1} onClick={toggleJoinModal}>Join Quiz</button>
        <button className={styles.btn2} onClick={toggleModal}>
          Add Quiz
        </button>
      </div>

      {modal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={toggleModal}>
              <IoCloseOutline />
            </span>
            <AddClass />
          </div>
        </div>
      )}

      {joinModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={toggleJoinModal}>
              <IoCloseOutline />
            </span>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
