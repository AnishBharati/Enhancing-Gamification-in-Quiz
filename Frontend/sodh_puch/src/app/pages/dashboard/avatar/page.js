import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Avatar({ quizPoint }) {
    const [showPopup, setShowPopup] = useState(false);
    const [unlockedAvatars, setUnlockedAvatars] = useState([false, false, false, false]);
    const [dashboardIcon, setDashboardIcon] = useState("/img/user.jpg");
    const [changed, setChanged] = useState("");
    const [unlockMessage, setUnlockMessage] = useState("");

    useEffect(() => {
        // Retrieve the saved dashboard icon from localStorage
        const savedIcon = localStorage.getItem("dashboardIcon");
        if (savedIcon) {
            setDashboardIcon(savedIcon);
        }

        // Determine unlocked avatars based on quiz points
        const unlockThresholds = [50, 100, 150, 200];
        const updatedUnlockedAvatars = unlockThresholds.map((threshold) => quizPoint >= threshold);
        setUnlockedAvatars(updatedUnlockedAvatars);

        // Ensure the current dashboard icon is valid
        const currentIconIndex = ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg", "avatar4.jpg"].indexOf(
            dashboardIcon.split("/").pop()
        );
        if (!updatedUnlockedAvatars[currentIconIndex]) {
            const firstUnlockedIndex = updatedUnlockedAvatars.findIndex((isUnlocked) => isUnlocked);
            if (firstUnlockedIndex !== -1) {
                const firstUnlockedIcon = `/img/avatar${firstUnlockedIndex + 1}.jpg`;
                setDashboardIcon(firstUnlockedIcon);
                localStorage.setItem("dashboardIcon", firstUnlockedIcon);
            }
        }

        // Check for new unlocks and display message only once
        const displayedThresholds = JSON.parse(localStorage.getItem("displayedThresholds")) || [];
        const newUnlockIndex = unlockThresholds.findIndex(
            (threshold, index) => quizPoint >= threshold && !displayedThresholds.includes(threshold)
        );

        if (newUnlockIndex !== -1) {
            const threshold = unlockThresholds[newUnlockIndex];
            setUnlockMessage(`🎉 Congratulations! A new avatar has been unlocked at ${threshold} points! 🎉`);
            localStorage.setItem("displayedThresholds", JSON.stringify([...displayedThresholds, threshold]));

            setTimeout(() => {
                setUnlockMessage("");
            }, 3000);
        }
    }, [quizPoint]);

    const handleAvatarClick = (avatar, index) => {
        if (unlockedAvatars[index]) {
            setDashboardIcon(`/img/${avatar}`);
            localStorage.setItem("dashboardIcon", `/img/${avatar}`);
            setChanged("🥳   Icon changed successfully!  🎉");
            setShowPopup(false);

            setTimeout(() => {
                setChanged("");
            }, 1500);
        }
    };

    return (
        <>
            {/* Current Dashboard Icon */}
            <div className={styles.imageCircle}>
                <img
                    src={dashboardIcon}
                    onClick={() => setShowPopup(true)}
                    alt="Dashboard Icon"
                    className={styles.circleImage}
                />
            </div>

            {/* Notification Message */}
            {changed && (
                <div className={styles.successPopupOverlay}>
                    <div className={styles.notification}>{changed}</div>
                </div>
            )}

            {/* Unlock Message */}
            {unlockMessage && (
                <div className={styles.successPopupOverlay}>
                    <div className={styles.notification}>{unlockMessage}</div>
                </div>
            )}

            {/* Popup for Avatar Selection */}
            {showPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h3>Dashboard Avatars</h3>
                        <p>Unlock some aesthetic avatars based on your Quiz Points!</p>
                        <div className={styles.shop}>
                            {["avatar1.jpg", "avatar2.jpg", "avatar3.jpg", "avatar4.jpg"].map((avatar, index) => (
                                <div
                                    key={index}
                                    className={`${styles.avatarItem} ${
                                        !unlockedAvatars[index] ? styles.locked : ""
                                    }`}
                                    onClick={() => handleAvatarClick(avatar, index)}
                                >
                                    <img
                                        src={`/img/${avatar}`}
                                        alt={`Avatar ${index + 1}`}
                                        className={styles.avatarImage}
                                        style={{
                                            filter: unlockedAvatars[index] ? "none" : "grayscale(100%)",
                                            cursor: unlockedAvatars[index] ? "pointer" : "not-allowed",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: unlockedAvatars[index] ? "inherit" : "red",
                                        }}
                                    >
                                        {unlockedAvatars[index]
                                            ? "Unlocked - Click to Set"
                                            : `Unlock at ${50 * (index + 1)} points`}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowPopup(false)} className={styles.closeButton}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
