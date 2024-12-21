'use client';
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { isAuthenticated } from "../(auth)/auth";
import { useRouter } from "next/navigation";
import { RiPoliceBadgeFill } from "react-icons/ri";
import axios from "../axiosSetup";

export default function Dashboard() {
    const router = useRouter();

    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
    const [confirmPasswordPopup, setConfirmPasswordPopup] = useState(false);
    const [username, setUsername] = useState('');
    const [fullname, setfullname] = useState('');  // Changed from surname to fullname
    const [email, setEmail] = useState('');
    const [currentPhoto, setCurrentPhoto] = useState('/img/user.jpg');
    const [newPhoto, setNewPhoto] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [successMessage, setSuccessMessage] = useState(false);

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

                // Assuming the structure you provided, we now access the first item in the data array
                const userDetails = data.data[0]; // Extract the first object from the data array

                if (userDetails) {
                    setUsername(userDetails.username);
                    setEmail(userDetails.email);
                    setfullname(userDetails.full_name);  // Changed from surname to fullname
                }

            } catch (error) {
                console.error("Error fetching data: ", error);
                alert("Failed to load user details. Please try again later.");
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            if (!await isAuthenticated()) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    const handleEditProfile = (e) => {
        e.preventDefault();

        axios
            .post("http://localhost:8000/update_details", { username, fullname, email })  // Changed surname to fullname
            .then((res) => {
                const token = res.data.token;
                if (token) {
                    localStorage.setItem("token", token);
                }
                setShowEditProfilePopup(false);
                setSuccessMessage(true);

                setTimeout(() => {
                    setSuccessMessage(false);
                }, 1300);
            });
    };

    const handlePasswordChange = (e) => {
        // if (!newPassword || !confirmNewPassword) {
        //     alert("Both password fields must be filled!");
        //     return;
        // }

        // if (newPassword !== confirmNewPassword) {
        //     alert("Passwords do not match!");
        //     return;
        // }

        // console.log("Password changed to:", newPassword);

        // setShowPasswordPopup(false);
        // setConfirmPasswordPopup(false);

        // setCurrentPassword('');
        // setNewPassword('');
        // setConfirmNewPassword('');

        // setSuccessMessage(true);

        // setTimeout(() => {
        //     setSuccessMessage(false);
        // }, 2000);
        e.preventDefault();
        if(newPassword !==confirmNewPassword){
            alert("New password and Confirm Password doesn't match");
            return;
        }
        axios
            .post("http://localhost:8000/update_password", {currentPassword, newPassword})
            .then((res) => {
                const token = res.data.token;
                if(token) {
                    localStorage.setItem("token", token);
                }
                setShowPasswordPopup(false);
                setConfirmPasswordPopup(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                
                setSuccessMessage(true);

                setTimeout(() => {
                    setSuccessMessage(false);
                }, 2000);
            })
    };

    return (
        <div className={styles.dashboardContainer}>
            {/* Left Section */}
            <div className={styles.leftSection}>
                <div className={styles.imageCircle}>
                    <img src="/img/lvl5.jpeg" alt="Dashboard Icon" className={styles.circleImage} />
                </div>
                <h2 className={styles.dashboardText}>Dashboard</h2>
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>User Level</p>
                        <p>Level 5</p>
                    </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>Quiz Points</p>
                        <p>10</p>
                    </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>EXP Points</p>
                        <p>100</p>
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
                <div className={styles.profileImage}>
                    <img src={currentPhoto} alt="User" className={styles.circleImage} />
                </div>
                <div className={styles.userInfo}>
                    <p><strong>Full Name:</strong> {fullname}</p>  {/* Changed from surname to fullname */}
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
                            onChange={(e) => setfullname(e.target.value)}
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
                        <button
                            className={styles.submitButton}
                            onClick={handleEditProfile}
                        >
                            Save
                        </button>
                        <button
                            className={styles.closeButton}
                            onClick={() => setShowEditProfilePopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Change Password Popup */}
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
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={styles.inputField}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={styles.inputField}
                        />
                        <button
                            className={styles.submitButton}
                            onClick={() => setConfirmPasswordPopup(true)}
                        >
                            Submit
                        </button>
                        <button
                            className={styles.closeButton}
                            onClick={() => setShowPasswordPopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Password Change Popup */}
            {confirmPasswordPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h4>Are you sure you want to change the password?</h4>
                        <div className={styles.confirmButtons}>
                            <button
                                className={styles.yesButton}
                                onClick={handlePasswordChange}
                            >
                                Yes
                            </button>
                            <button
                                className={styles.noButton}
                                onClick={() => setConfirmPasswordPopup(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className={styles.successPopupOverlay}>
                    <div className={styles.successPopup}>
                        <h4>Profile edited Successfully!</h4>
                    </div>
                </div>
            )}
        </div>
    );
}
