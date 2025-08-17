import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/landing_page";
import SignIn from "../pages/signin";

export default function AppRoutes(){

    return(
        <>
    
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage/>} /> 
                <Route path="/signin" element={<SignIn />} />
                
                
            </Routes>
        </Router>
        </>
    );
}