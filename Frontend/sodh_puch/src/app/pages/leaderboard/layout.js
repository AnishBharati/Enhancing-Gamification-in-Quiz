import Navbar from "../../components/navbar/page"
import Sidebar from "../../components/sidebar/page"
import styles from "./page.module.css"

export default function layout ({children}){
    return(
        <div className={styles.maincontainer}>
              <div className={styles.menu}>
              <Navbar/>
              </div>
              <div className={styles.container}>
              <div className={styles.content1}>
                <Sidebar/>
                </div>
                <div className={styles.content2}>
                {children}
              </div>
              </div>
        </div>
    )
}