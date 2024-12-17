
import Navbar from "./components/navbar/page";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        
        {children}
     
      </body>
    </html>
  );
}
