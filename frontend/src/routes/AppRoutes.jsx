import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../pages/layout.jsx";

import LandingPage from "../pages/landing_page";
import SignIn from "../pages/signin";
import SignUp from "../pages/signup";
import UserForm from "../pages/user_details";
import Home from "../components/home_page.jsx";
import PostComplaint from "../components/complaint_page.jsx";
import UserDashboard from "../components/user_dashboard.jsx";
import Help from "../components/help.jsx";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user_registration" element={<UserForm />} />

        {/* Protected/Layout Routes */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/post-complaint" element={<PostComplaint />} />
          <Route path="/help" element={<Help />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
