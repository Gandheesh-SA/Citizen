import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../pages/MainPage/layout.jsx";

import LandingPage from "../pages/landing_page";
import SignIn from "../pages/User/signin.jsx";
import SignUp from "../pages/User/signup.jsx";
import UserForm from "../pages/User/user_details.jsx";
import Home from "../components/main/home_page.jsx";
import PostComplaint from "../components/main/complaint_page.jsx"

import Help from "../components/main/help.jsx";
import AdminDashboard from "../pages/Admin/admin_dashboard.jsx";
import UserDashboard from "../components/main/user_dashboard.jsx";
import PostAnnouncement from "../components/main/post_announcement.jsx";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user_registration" element={<UserForm />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />


        {/* Protected/Layout Routes */}
      <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/post-complaint" element={<PostComplaint />} />
          <Route path="/post-announcement" element={<PostAnnouncement />} />
          <Route path="/help" element={<Help />} />
          <Route path="/user-dashboard" element={<UserDashboard />} /> 
          <Route path="/post-announcement" element={<PostAnnouncement />} />
         

        </Route> 
      </Routes>
    </Router>
  );
}
