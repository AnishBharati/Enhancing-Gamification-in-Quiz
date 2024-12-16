"use client"
import React, { useState } from 'react'
import styles from "./page.module.css"; 
import { FiPlusCircle } from "react-icons/fi";

export default function AddQuiz(){
    
    function show()
    {
        const main= document.getElementById("main");
        if (main.style.display === "none") {
            main.style.display = "flex";  // Show the element
          } else {
            main.style.display = "none";  // Hide the element
          }
    }

    function hide(){
        const main= document.getElementById("main");
        if (main.style.display === "flex") {
            main.style.display = "none";  // Show the element
          } 
    }


    const [question,setQuestion ] = useState("");
    const [correctanswer, setCorrectanswer] = useState("");
    const [option1, setOption1] = useState("");
    const [option2, setOption2] = useState("");
    const [option3, setOption3] = useState("");
    const [option4, setOption4] = useState("");
    

    const handleSubmit = (e) => {
      
        e.preventDefault();
        console.log("Question:", question);
        console.log("CorrectAnswer:", correctanswer);
        console.log("Option1:", option1);
        console.log("Option2:", option2);
        console.log("Option3:", option3);
        console.log("Option4:", option4);
        setQuestion("");
        setCorrectanswer(""); 
        setOption1(""); 
        setOption2(""); 
        setOption3(""); 
        setOption4(""); 
    };





    return(
        <div >
            <h1 className={styles.title}>CREATE QUIZ  <button onClick={show} className={styles.icon}> <FiPlusCircle /></button></h1>
                
            <div className={styles.maincontainer}
            id='main'>
                    <form action=""  onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                   <label htmlFor="question"
                   className={styles.label}>
                    Type a Question:
                      </label>
                   
                    <input className={styles.input}
                     type="text"
                     id='question'
                     placeholder='Your Question'
                     required 
                     value={question}
                     onChange={(e) => setQuestion(e.target.value)}
                     />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="correctanswer">
                        Correct Answer:</label>

                    
                    <input className={styles.input}
                     type="text"
                     id='correctanswer'
                     placeholder='CorrectAnswer'
                     required
                     value={correctanswer}
                     onChange={(e) => setCorrectanswer(e.target.value)}
                     />
                </div>
                <div className={styles.field}>
                    <label htmlFor="option1"
                    className={styles.label}>
                        Write  options for your question:

                    </label>
                    <div className={styles.option}>
                    <input className={styles.input}
                     type="text"
                     id='option1'
                     placeholder='Option1'
                     required
                     value={option1}
                     onChange={(e) => setOption1(e.target.value)}
                     />

                    <input className={styles.input}
                     type="text"
                     id='option2'
                     placeholder='Option2'
                     required
                     value={option2}
                     onChange={(e) => setOption2(e.target.value)}
                     />
                     </div>
                     <div className={styles.option}>
                       <input className={styles.input}
                     type="text"
                     id='option3'
                     placeholder='Option3'
                     required
                     value={option3}
                     onChange={(e) => setOption3(e.target.value)}
                     />
                      <input className={styles.input}
                     type="text"
                     id='option4'
                     placeholder='Option4'
                     required
                     value={option4}
                     onChange={(e) => setOption4(e.target.value)}
                     />
                     </div>
                </div>

                    
               
                     <button className={styles.button} onClick={hide} type='submit'>Submit</button>
                    </form>

                    </div>
        </div>
    )
}