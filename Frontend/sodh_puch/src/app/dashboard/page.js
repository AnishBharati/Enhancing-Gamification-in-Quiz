"use client";
import React, { useEffect } from "react";
import styles from "./page.module.css"
import { isAuthenticated } from "../(auth)/auth";
import { useRouter } from "next/navigation";
export default function Dashboard(){

    // const router = useRouter();
    // useEffect(()=>{
    //     if((!isAuthenticated)){
    //         router.push('/login');
    //     }
    // })
    return(
        <div className={styles.containeer}>dashboard</div>
    )
}