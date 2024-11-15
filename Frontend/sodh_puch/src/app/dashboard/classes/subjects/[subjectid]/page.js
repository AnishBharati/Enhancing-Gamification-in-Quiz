"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Link from "next/link";

export default function SubjectDetails({ params }) {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [open, setOpen] = useState(false);

  const option = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const storedTopics = JSON.parse(localStorage.getItem("topics")) || [];
    const storedDescriptions =
      JSON.parse(localStorage.getItem("descriptions")) || [];
    setTopics(storedTopics);
    setDescriptions(storedDescriptions);
  }, []);

  const subjectid = params.subjectid;
  const subjectTopic = topics.find((topic) => topic === subjectid);
  const subjectDescription = subjectTopic
    ? descriptions[topics.indexOf(subjectTopic)]
    : null;

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.heading}>
          {subjectTopic}{" "}
          <span className={styles.icon} onClick={option}>
            <BiDotsVerticalRounded />
          </span>
        </h2>
        <div className={`${styles.dropdown} ${open ? styles.show : ""}`}>
        <Link  href="/dashboard/classes/addquiz"  className={styles.add} > <span  >Add Ouiz</span></Link>   
        <Link href="/dashboard/classes/subjects" className={styles.add} > <span >Go Back</span> </Link> 
        </div>
      
      
        <p className={styles.details}>{subjectDescription}</p>
      </div>
      <div  className={styles.box}>

        <div>
            <h3>   Topic :  </h3>
            

        </div>

      </div>

    </div>
  );
}
