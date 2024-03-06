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
import { ThemeProvider } from "./ThemeContext";

//LANDING
import Landing from "./Landing.jsx";
import Home from "./components/Home/Home.jsx";
import About from "./components/About/About.jsx";
import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import BookAppointment from "./components/Book/BookAppointment.jsx";
import CheckAppointment from "./components/Book/CheckAppointment.jsx";
import AppointmentSuccess from "./components/Book/AppointmentSuccess.jsx";

//ADMIN
import AdminHome from "./components/Admin/AdminHome.jsx";
import AdminAppointment from "./components/Admin/AdminAppointment.jsx";
import AdminSchedule from "./components/Admin/AdminSchedule.jsx";
import AdminPatientRecord from "./components/Admin/AdminPatientrecord.jsx";
import AdminAccount from "./components/Admin/AdminAccount.jsx";
import AdminCalendar from "./components/Admin/AdminCalendar.jsx";
//DOCTOR
import DoctorDashboard from "./DoctorDashboard.jsx";
import DoctorHome from "./components/Doctor/DoctorHome.jsx";
import DoctorAppointment from "./components/Doctor/DoctorAppointment.jsx";
import DoctorSchedule from "./components/Doctor/DoctorSchedule.jsx";
import DoctorAccount from "./components/Doctor/DoctorAccount.jsx";
import DoctorPatientRecord from "./components/Doctor/DoctorPatientRecord.jsx";
import DoctorEMR from "./components/Doctor/DoctorEMR.jsx";
//PATIENT
import PatientDashboard from "./PatientDashboard.jsx";
import PatientHome from "./components/Patient/PatientHome.jsx";
import PatientAppointment from "./components/Patient/PatientAppointment.jsx";
import PatientSchedule from "./components/Patient/PatientSchedule.jsx";
import PatientRecords from "./components/Patient/PatientRecords.jsx";
import PatientAccount from "./components/Patient/PatientAccount.jsx";
import RegisterPhone from "./components/Register/RegisterPhone.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />}>
        <Route index path="" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="registerphone" element={<RegisterPhone />} />

        <Route path="appointment" element={<BookAppointment />} />
        <Route path="checkappointment" element={<CheckAppointment />} />
        <Route path="appointmentsuccess" element={<AppointmentSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admindashboard" element={<AdminDashboard />}>
        <Route index path="" element={<AdminHome />} />
        <Route path="adminhome" element={<AdminHome />} />
        <Route path="adminappointment" element={<AdminAppointment />} />
        <Route path="adminschedule" element={<AdminSchedule />} />
        <Route path="adminpatientrecord" element={<AdminPatientRecord />} />
        <Route path="adminaccount" element={<AdminAccount />} />
        <Route path="admincalendar" element={<AdminCalendar />} />
      </Route>
      <Route path="doctordashboard" element={<DoctorDashboard />}>
        <Route index path="" element={<DoctorHome />} />
        <Route path="doctorhome" element={<DoctorHome />} />
        <Route path="doctorappointment" element={<DoctorAppointment />} />
        <Route path="doctorschedule" element={<DoctorSchedule />} />
        <Route path="doctorpatientrecord" element={<DoctorPatientRecord />} />
        <Route path="doctoraccount" element={<DoctorAccount />} />
        <Route path="doctoremr" element={<DoctorEMR />} />
      </Route>
      <Route path="patientdashboard" element={<PatientDashboard />}>
        <Route index path="" element={<PatientHome />} />
        <Route index path="patienthome" element={<PatientHome />} />
        <Route path="patientappointment" element={<PatientAppointment />} />
        <Route path="patientschedule" element={<PatientSchedule />} />
        <Route path="patientrecords" element={<PatientRecords />} />
        <Route path="patientaccount" element={<PatientAccount />} />
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
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
