"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";
import axios from "../../../axiosSetup";
import { useSearchParams } from "next/navigation";
import { IoMdNotificationsOutline } from "react-icons/io";
import { ImCross } from "react-icons/im";
import Link from "next/link";

export default function SubjectDetails() {
  const [topics, setTopics] = useState([]); // Ensure this is initialized as an array
  const [showPopup, setShowPopup] = useState(false);
  const [quizTopic, setQuizTopic] = useState(""); // State to store the input for the new topic
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const [teacherData, setTeacherData] = useState(null); // Store teacher data
  const router = useRouter();
  const params = useParams(); // Use `useParams()` to get params from the URL
  const searchParams = useSearchParams(); // Access query params
  const [isMarksPopup, setIsMarksPopup] = useState(false);
  const [marks, setMarks] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const subjectid = params?.subjectid; // Accessing subjectid from params
  const classNamed = searchParams.get("class");
  const id = searchParams.get("id");

  // Handle topic click to toggle options (Add Quiz/Delete)
  const handleTopicClick = (index) => {
    setSelectedTopicIndex(selectedTopicIndex === index ? null : index);
  };

  // Open popup to add a new topic
  const openPopup = () => setShowPopup(true);

  // Close popup and reset state
  const closePopup = () => {
    setShowPopup(false);
  };

  // Handle adding a new topic
  const handleAddTopic = (e) => {
    e.preventDefault();

    if (!quizTopic.trim()) {
      return; // Prevent submitting if quizTopic is empty
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    axios
      .post(`${backendUrl}/add_topic`, {
        quizTopic,
        quizClass: subjectid,
      })
      .then((res) => {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Assuming the response contains the newly added topic
        const newTopic = res.data.newTopic; // Ensure newTopic is returned in the response
        if (newTopic) {
          setTopics((prevTopics) => [...prevTopics, newTopic]); // Add new topic to state
        }

        setQuizTopic(""); // Reset input field
        closePopup();
        router.push("/pages/subjects");
      })
      .catch((err) => {
        console.error("Error adding topic:", err);
      });
  };

  const fetchTeacherData = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      const response = await axios.get(`${backendUrl}/get_teacher?id=${id}`);

      if (!response.data || response.data.length === 0) {
        // No data or empty response, do nothing or handle as needed
        return; // Optionally, you can return early or log something else if needed
      }
      setTeacherData({
        userId: response.data.userId,
        teacherId: response.data.data, // Assuming this is the teacher's ID
      });
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };

  useEffect(() => {
    fetchTeacherData(); // Fetch teacher data when component mounts
  }, [id]); // Only fetch once per subject id

  useEffect(() => {}, []);

  // Fetch existing topics from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(
          `${backendUrl}/see_topic?quiz_class=${subjectid}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // If the status code is not 200, silently skip the error without logging
        if (!response.ok) {
          return; // Simply return without further action or logging
        }

        // Attempt to read the raw response body
        const rawResponse = await response.text();

        // If the response body is empty, silently skip
        if (!rawResponse) {
          return; // No data, so skip without logging or error
        }

        // Try to parse the response as JSON
        const data = JSON.parse(rawResponse);

        // Check if the required data exists, if not silently skip
        if (!data || !data.quiz_topics) {
          return; // No quiz topics, so skip silently
        }

        const quizTopics = data.quiz_topics || []; // Ensure quiz_topics is always an array
        setTopics(quizTopics);
      } catch (error) {
        // If there is an error, log it only when there's an actual issue (optional)
        console.error("Error in fetching topics:", error);
      }
    };

    fetchData();
  }, [subjectid]); // Re-fetch when subjectid changes

  // Handle deleting a topic
  const handleDeleteTopic = (id, e) => {
    e.preventDefault();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const userConfirmed = window.confirm(
      "Are you sure do you want to delete this topic?"
    );
    if (!userConfirmed) {
      return;
    }
    axios
      .delete(`${backendUrl}/delete_topic`, { data: { id } })
      .then((res) => {
        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
        }
        setSuccessMessage(true);

        // Hide the success message after 1.5 seconds
        setTimeout(() => {
          setSuccessMessage(false);
        }, 2000);
        router.push("/pages/subjects");
      })
      .catch((error) => {
        console.error("Error in deleting topic: ", error);
      });
  };

  const handleOpenPopup = (id) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    setIsMarksPopup(true); // Correctly set state to show the popup
    axios.get(`${backendUrl}/get_marks?quiz_topic=${id}`).then((res) => {
      setMarks(res.data.marks || []); // Ensure the marks array is fetched
    });
  };

  const handleAlert = (id) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    axios
      .get(`${backendUrl}/check_student_quiz?quiz_topic=${id}`)
      .then((res) => {
        // Check if the 'data' array inside 'res.data' is empty
        if (!res.data || res.data.data.length === 0) {
          // If the array is empty, redirect to the quiz page
          router.push(
            `/pages/subjects/${subjectid}/seeQuiz?id=${id}&classid=${subjectid}`
          );
        } else {
          // If the array has data, show the alert and redirect to the subjects page
          alert("You have already Submitted Quiz");
          router.push("/pages/subjects");
        }
      })
      .catch((error) => {
        console.error("Error checking quiz submission:", error);
      });
  };

  // Handle adding a quiz for a topic
  // const handleAddQuiz = () => {
  //   router.push(`/pages/subjects/${subjectid}/addquiz`);
  // };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.top}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoIosArrowBack size={30} />
        </button>
        <Link
          href={`/pages/subjects/${subjectid}/see_asked_question?classid=${subjectid}`}
        >
          <button className={styles.btn}>
            {" "}
            <IoMdNotificationsOutline size={30} />
            See Asked Questions
          </button>
        </Link>
      </div>
      {/* Subject Header */}
      <div className={styles.subjectCard}>
        <div>
          <h1 className={styles.subjectName}>{classNamed}</h1>
          <p className={styles.subjectDescription}>Subject Description</p>
        </div>
        {/* Only show the Add Chapter button if teacherData is available and teacherId matches userId */}
        {teacherData && teacherData.teacherId == teacherData.userId && (
          <div className={styles.addIcon} onClick={openPopup}>
            <IoMdAdd size={30} title="Add Chapter" />
          </div>
        )}
      </div>

      {/* Topics */}
      {topics.length > 0 ? (
        topics.map((topic, index) => (
          <div
            key={topic.id} // Ensure topic has a valid 'id' to use as a key
            className={styles.topicContainer}
            onClick={() => handleTopicClick(index)}
          >
            <h2 className={styles.heading}>{topic.quiz_topic}</h2>
            {selectedTopicIndex === index &&
              (teacherData && teacherData.teacherId == teacherData.userId ? (
                <div className={styles.topicOptions}>
                  <Link
                    href={`/pages/subjects/${subjectid}/addquiz?id=${
                      topic.id
                    }&classid=${subjectid}&class=${encodeURIComponent(
                      topic.quiz_topic
                    )}`}
                  >
                    {/*Adding Quiz */}
                    <button className={styles.addQuizButton}>Add Quiz</button>
                  </Link>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown closure
                      handleDeleteTopic(topic.id, e);
                    }}
                  >
                    Delete Chapter
                  </button>
                  <button
                    className={styles.seButton}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown closure
                      handleOpenPopup(topic.id);
                    }}
                  >
                    See Marks
                  </button>
                </div>
              ) : (
                <Link
                  href={`/pages/subjects/${subjectid}/seeQuiz?id=${
                    topic.id
                  }&classid=${subjectid}&class=${encodeURIComponent(
                    topic.quiz_topic
                  )}`}
                >
                  <button
                    onClick={() => handleAlert(topic.id)}
                    className={styles.addQuizButton}
                  >
                    Do Quiz
                  </button>
                </Link>
              ))}
          </div>
        ))
      ) : (
        <p>No topics available.</p> // Message to show if no topics are present
      )}

      {/* Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h2>Add New Chapter</h2>
            <input
              type="text"
              placeholder="Enter Chapter Name"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className={styles.inputField}
            />
            <div className={styles.buttonGroup}>
              <button onClick={handleAddTopic} className={styles.addButton}>
                Add
              </button>
              <button onClick={closePopup} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isMarksPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h2>See Marks</h2>
            {marks && marks.length > 0 ? (
              <div className={styles.marksTableContainer}>
                <table className={styles.marksTable}>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark, index) => (
                      <tr key={index}>
                        <td>{mark.student_name}</td>
                        <td>{mark.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No marks available</p>
            )}

            {/* Cross Icon in the top right */}
            <button
              onClick={() => setIsMarksPopup(false)}
              className={styles.closeButton}
              title="Close"
            >
              <ImCross size={15} />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className={styles.successPopupOverlay}>
          <div className={styles.successPopup}>
            <h3>Success!</h3>
            <p>Topic is deleted successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
