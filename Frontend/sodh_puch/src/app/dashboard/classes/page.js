"use client";
import styles from "./page.module.css";
import React from "react";
import { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

import AddClass from "./addClass/page.js";
export default function Classes() {
  const [modal, setModal] = useState(false);
  const toogle = () => {
    setModal(!modal);
  };

  return (
    <div className={styles.container}>
      <div className={styles.container1}>
        <span>
          Design your first Quiz or Join
          <br />
        </span>
        <span>
          {" "}
          Make your own question bank!
          <br />
          It’s quick and easy!
        </span>
      </div>

      <div className={styles.container2}>
        <button className={styles.btn1}>Join Quiz</button>
        <button className={styles.btn2} onClick={toogle}>
          Add Quiz
        </button>
      </div>
      {modal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={toogle}>
              <IoCloseOutline />
            </span>
            <AddClass />
          </div>
        </div>
      )}
    </div>
  );
}
