'use client';
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Avatar from "./avatar/page";
import { isAuthenticated } from "../(auth)/auth";
import { useRouter } from "next/navigation";
import { RiPoliceBadgeFill } from "react-icons/ri";
import axios from "../../axiosSetup";

export default function Dashboard() {
    const router = useRouter();

    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
    const [confirmPasswordPopup, setConfirmPasswordPopup] = useState(false);
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [currentPhoto, setCurrentPhoto] = useState('/img/user.jpg'); // Default photo
    const [newPhoto, setNewPhoto] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [quizPoint, setQuizPoint] = useState("");
    const[expPoint, setExpPoint] = useState("");
    const [successMessage, setSuccessMessage] = useState(false);

    // Fetch user details on initial load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Authentication token not found");

                const response = await fetch("http://localhost:8000/see_details", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();

                // Extract the first user data
                const userDetails = data.data[0];
                if (userDetails) {
                    setUsername(userDetails.username);
                    setEmail(userDetails.email);
                    setFullname(userDetails.full_name);
                    
                    // Set the full URL for photo (adjusting for the path returned by the server)
                    setCurrentPhoto(userDetails.photo_url ? `http://localhost:8000/${userDetails.photo_url}` : '/img/user.jpg');
                    setQuizPoint(userDetails.quiz_points);
                    setExpPoint(userDetails.exp_points);
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
                alert("Failed to load user details. Please try again later.");
            }
        };

        fetchData();
    }, []);
    
    // Check authentication when page loads
    useEffect(() => {
        const checkAuth = async () => {
            if (!await isAuthenticated()) {
                router.push('/pages/login');
            }
        };
        checkAuth();
    }, [router]);

    const getUserLevel = (expPoints) =>{
        if (expPoints >= 1600) return 5;
        if (expPoints >= 800) return 4;
        if (expPoints >= 400) return 3;
        if (expPoints >= 200) return 2;
        if (expPoints >= 100) return 1;
        return 0;
    }
    // Handle profile edit and photo upload
    const handleEditProfile = async (e) => {
        e.preventDefault();

        // Create a new FormData object to send both text and file data
        const formData = new FormData();
        formData.append("username", username);
        formData.append("fullname", fullname);
        formData.append("email", email);

        if (newPhoto) {
            formData.append("photo", newPhoto); // Attach the photo file
        }

        try {
            // Send POST request with formData using axios
            const response = await axios.put("http://localhost:8000/update_details", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Ensure it's set to send files
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            // Handle success response
            const token = response.data.token;
            if (token) {
                localStorage.setItem("token", token);
            }

            setShowEditProfilePopup(false);
            setSuccessMessage(true);

            // Hide the success message after 1.5 seconds
            setTimeout(() => {
                setSuccessMessage(false);
            }, 2000);

            router.push("/pages/dashboard");
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    // Handle password change request
    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            alert("New password and Confirm Password don't match");
            return;
        }

        axios
            .post("http://localhost:8000/update_password", { currentPassword, newPassword })
            .then((res) => {
                const token = res.data.token;
                if (token) {
                    localStorage.setItem("token", token);
                }
                setShowPasswordPopup(false);
                setConfirmPasswordPopup(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setSuccessMessage(true);

                // Hide the success message after 2 seconds
                setTimeout(() => {
                    setSuccessMessage(false);
                }, 2000);
            })
            .catch((error) => {
                console.error("Error changing password: ", error);
                alert("Failed to change password. Please try again.");
            });
    };
  

    return (
        <div className={styles.dashboardContainer}>
            {/* Left Section */}
            <div className={styles.leftSection}>

          <Avatar quizPoint={quizPoint}/> 
                <h2 className={styles.dashboardText}>Dashboard</h2>
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>User Level</p>
                        <p>Level {getUserLevel(expPoint)}</p>
                        </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>Quiz Points</p>
                        <p>{quizPoint}</p>
                    </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>EXP Points</p>
                        <p>{expPoint}</p>
                    </div>
                </div>
                <h3 className={styles.badgesTitle}>Badges Unlocked</h3>
                <div className={styles.badgesRow}>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/2.lvl5.jpeg" alt="Badge 1" />
                        </div>
                        <p className={styles.badgeText}>Level 5</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 2" />
                        </div>
                        <p className={styles.badgeText}>Level 10</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 3" />
                        </div>
                        <p className={styles.badgeText}>Level 15</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 4" />
                        </div>
                        <p className={styles.badgeText}>Level 20</p>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className={styles.rightSection}>
                <h1>
                    User Details
                </h1>
                <div className={styles.profileImage}>
                    <img src={currentPhoto} alt="User"  className={styles.circleImage} />
                </div>
                <div className={styles.userInfo}>
                    <p><strong>Full Name:</strong> {fullname}</p>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {email}</p>
                </div>
                <div className={styles.profileButtons}>
                    <button
                        className={styles.editProfileButton}
                        onClick={() => setShowEditProfilePopup(true)}
                    >
                        Edit Profile
                    </button>
                    <button
                        className={styles.changePasswordButton}
                        onClick={() => setShowPasswordPopup(true)}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* Edit Profile Popup */}
            {showEditProfilePopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h3>Edit Profile</h3>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <div className={styles.fileInputContainer}>
                            <label htmlFor="photoUpload" className={styles.fileLabel}>
                                Upload Photo (Optional)
                            </label>
                            <input
                                id="photoUpload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewPhoto(e.target.files[0])}
                                className={styles.fileInput}
                            />
                        </div>
                        <button onClick={handleEditProfile} className={styles.submitButton}>
                            Save Changes
                        </button>
                        <button
                            onClick={() => setShowEditProfilePopup(false)}
                            className={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Password Change Popup */}
            {showPasswordPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h3>Change Password</h3>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                        <button onClick={handlePasswordChange} className={styles.submitButton}>
                            Change Password
                        </button>
                        <button
                            onClick={() => setShowPasswordPopup(false)}
                            className={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {successMessage && (
    <div className={styles.successPopupOverlay}>
        <div className={styles.successPopup}>
            <h3>Success!</h3>
            <p>Your changes have been saved successfully.</p>
        </div>
    </div>
)}

        </div>
    );
}
