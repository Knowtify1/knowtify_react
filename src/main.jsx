//main entry point of the application
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";

// import App from "./App.jsx";
// import Landing from "./pages/Landing.jsx";
//import 'bootstrap/dist/css/bootstrap.in';

import Landing from "./Landing.jsx";
import Home from "./components/Home/Home.jsx";
import About from "./components/About/About.jsx";
import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import BookAppointment from "./components/Book/BookAppointment.jsx";
import CheckAppointment from "./components/Book/CheckAppointment.jsx";

import AdminHome from "./components/Admin/AdminHome.jsx";
import AdminAppointment from "./components/Admin/AdminAppointment.jsx";
import AdminSchedule from "./components/Admin/AdminSchedule.jsx";
import AdminPatientRecord from "./components/Admin/AdminPatientrecord.jsx";
import AdminAccount from "./components/Admin/AdminAccount.jsx";

import DoctorDashboard from "./DoctorDashboard.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />}>
        <Route index path="" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="appointment" element={<BookAppointment />} />
        <Route path="checkappointment" element={<CheckAppointment />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admindashboard" element={<AdminDashboard />}>
        <Route index path="home" element={<AdminHome />} />
        <Route index path="appointment" element={<AdminAppointment />} />
        <Route index path="schedule" element={<AdminSchedule />} />
        <Route index path="patientrecord" element={<AdminPatientRecord />} />
        <Route index path="account" element={<AdminAccount />} />
      </Route>
      <Route path="doctordashboard" element={<DoctorDashboard />}></Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <BrowserRouter> */}
    {/* <App /> */}
    <RouterProvider router={router} />
    {/* </BrowserRouter> */}
  </React.StrictMode>
);

// const root = ReactDOM.createRoot(document.getElementById("root"))
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// )
