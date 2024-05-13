import React, { useEffect, useState } from "react";
import TableAppointments from "./Components/TableAppointments";
import DoctorPatients from "./Components/DoctorPatients.jsx";
import { Button, Card, Modal } from "antd";

function DoctorAppointment() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };
  const createAppointment = async () => {
    console.log("Creating appointment...");
    openNotification();
    setIsModalVisible(false);
    // Add message when appointment is booked
    notification.success({
      message: "Appointment Booked",
      description: "Your appointment has been successfully booked!",
    });
  };
  return (
    <>
      <div>
        <Card
          className="overflow-auto pl-5" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-"
              style={{ color: "#333" }}
            >
              Doctor Appointments
            </h3>{" "}
          </div>
          <DoctorPatients />
        </Card>
      </div>
    </>
  );
}

export default DoctorAppointment;
