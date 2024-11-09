"use client";
import { useState, useEffect } from "react";

export default function SubjectDetails({ params }) {
  const [topics, setTopics] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  
  useEffect(() => {
    
    const storedTopics = JSON.parse(localStorage.getItem("topics")) || [];
    const storedDescriptions = JSON.parse(localStorage.getItem("descriptions")) || [];

    setTopics(storedTopics);
    setDescriptions(storedDescriptions);
  }, []);

  
const subjectid =  params.subjectid; 
const subjectTopic = topics.find(topic=>topic===subjectid)
const subjectDescription = subjectTopic ? descriptions[topics.indexOf(subjectTopic)] : null;  




  return (
    <div>
      <h2>{subjectTopic}</h2>
      <p>{subjectDescription}</p>
    </div>
  );
}
