import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SideNav from "./SideNave";
import Home from "./Home";
import OTC from "./OTC";
import ZUELIG from "./ZUELIG";
import UNILAB from "./UNILAB";
import METRO from "./METRO";
import GENERICS from "./GENERICS";
import BRANDED from "./BRANDED";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";
import { useEffect, useRef } from "react";

function App() {
  const docRef = doc(db, "USER", "SAfpMvZoRQh0oXBeT6UI");

  const getData = async () => {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("User Data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      getData();
      hasFetched.current = true;
    }
  }, []);

  return (
    <div className="min-h-screen flex overflow-auto">
      <Router>
        <SideNav />
        {/* Ensure the content area scrolls if needed */}
        <div className="flex-1 p-10 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/otc" element={<OTC />} />
            <Route path="/zuelig" element={<ZUELIG />} />
            <Route path="/unilab" element={<UNILAB />} />
            <Route path="/metro" element={<METRO />} />
            <Route path="/generics" element={<GENERICS />} />
            <Route path="/branded" element={<BRANDED />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
