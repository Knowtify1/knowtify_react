import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Card, Button } from "antd";
import { CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import knowtifylogo from "../../assets/knowtifylogo.png";
import knowtifylogov2 from "../../assets/knowtifymod.svg";
import doc from "../../assets/doc.png";
import pat from "../../assets/pat.png";
import emr from "../../assets/emr.png";
import cal from "../../assets/calendar.png";
import sms from "../../assets/sms.png";
import doc2 from "../../assets/doc2.png";
import resume from "../../assets/resume.png";
import andre from "../../assets/andre.jpeg";
import marj from "../../assets/marj.jpeg";
import { sendSMS } from "../../config/sendSMS";

function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSendSMS = async () => {
    try {
      await sendSMS(phoneNumber, message);
      alert("SMS sent successfully!");
    } catch (error) {
      alert("Failed to send SMS. Please try again later.");
    }
  };

  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [userType, setUserType] = useState(""); // "patient" or "doctor"
  const navigate = useNavigate();

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    closeModal();

    if (type === "patient") {
      navigate("/appointment");
    } else if (type === "doctor") {
      navigate("/login");
    }
  };

  const FeatureItem = ({ image }) => (
    <div className="p-2 rounded-md mb-2 mt-2">{image}</div>
  );

  const Feature = ({ description, title }) => (
    <div className="p-8 rounded-md mb-2 mt-30">
      <h1 className="text-2xl text-green-800 font-bold">{title}</h1>
      <p
        className="text-gray-600"
        style={{ color: "#666666", letterSpacing: "1px" }}
      >
        {description}
      </p>
    </div>
  );

  const DeveloperItem = ({ image }) => <div>{image}</div>;

  const Developer = ({ description, title }) => (
    <div className="p-8 rounded-md mb-2 mt-30">
      <h1 className="text-2xl text-green-800 font-bold">{title}</h1>
      <p
        className="text-gray-600"
        style={{ color: "#666666", letterSpacing: "1px" }}
      >
        {description}
      </p>
    </div>
  );

  useEffect(() => {
    // Handle userType state as needed
    console.log("User type selected:", userType);
  }, [userType]);

  const cardStyle = {
    width: 400,
    cursor: "pointer",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div className="min-h-screen flex">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="User Type Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            backgroundColor: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          },
        }}
      >
        <Button
          type="link"
          icon={
            <CloseCircleOutlined
              style={{ fontSize: "1.5rem", color: "white" }}
            />
          }
          style={{
            position: "relative",
            top: "0x",
            right: "-400px",
            fontSize: "1.5rem",
            color: "white",
          }}
          onClick={closeModal}
        />
        <div style={{ textAlign: "center", color: "white" }}>
          <p style={{ fontSize: "1.5rem" }}>Choose your role:</p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Card
              title="I am a Patient"
              style={cardStyle}
              onClick={() => handleUserTypeSelection("patient")}
              cover={<img src={pat} alt="bookheader" className="" />}
            ></Card>
            <Card
              title="I am a Doctor"
              style={cardStyle}
              onClick={() => handleUserTypeSelection("doctor")}
              cover={<img src={doc} alt="bookheader" className="" />}
            ></Card>
          </div>
        </div>
      </Modal>

      <div className="flex-1">
        <header className="bg-white py-4  fixed w-full z-50">
          <div className="container mx-auto flex items-center justify-between px-4 sm:px-10 lg:px-20">
            <img src={knowtifylogov2} alt="knowtifylogo" className="h-12" />
            <div className="flex flex-wrap items-center">
              {/* Add your login/sign-up button */}
              <Link to="/appointment" className="mr-2 sm:mr-4">
                <Button className="text-sm sm:text-base">Find a Doctor</Button>
              </Link>
              <Link to="/login" className="mr-2 sm:mr-4">
                <Button className="text-sm sm:text-base">Login</Button>
              </Link>
              <Link to="/register" className="mr-2 sm:mr-6">
                <Button className="text-sm sm:text-base bg-green-600">Sign Up</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-30 mt-30 px-40 flex flex-col items-center">
          <section>
            <div className=" flex items-center">
              <div>
                <h1 className="text-5xl font-bold text-gray-800">
                  Manage your patients <br></br> in one website.
                </h1>
                <br></br>
                <p>
                  <CheckOutlined className="text-green-500 mr-2" /> Electronic
                  Medical Records
                </p>
                <p>
                  <CheckOutlined className="text-green-500 mr-2" /> Appointment
                  scheduling
                </p>
                <p>
                  <CheckOutlined className="text-green-500 mr-2" /> Reminder
                  System
                </p>
              </div>
              <div className="p-2">
                <FeatureItem
                  image={
                    <img src={doc2} alt="Image1" className="w-85 max-h-90" />
                  }
                />
              </div>
            </div>
          </section>

          <section className="mb-2 mx-auto ">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 items-start">
              Key Features:
            </h2>

            <div>
              <div className="bg-white p-2 rounded-md flex items-center">
                <FeatureItem
                  image={
                    <img
                      src={emr}
                      alt="Image1"
                      className="w-30 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
                <Feature
                  title="Integrated EMR"
                  description="Access Electronic Medical Records (EMR) seamlessly with Knowtify. Our integrated EMR feature allows doctors to manage patient records efficiently and provides easy access to important medical information. Improve your workflow and enhance patient care by utilizing our comprehensive EMR system."
                />
              </div>
              <div className="bg-white p-2 rounded-md  flex items-center">
                <Feature
                  title="Dynamic Calendar"
                  description="Stay organized with Knowtify's dynamic calendar feature. Manage appointments and schedules with ease, ensuring that you are always up-to-date with your patient appointments. Our dynamic calendar adapts to your needs, making it simple for you to plan and organize your day efficiently."
                />
                <FeatureItem
                  image={
                    <img
                      src={cal}
                      alt="Image1"
                      className="w-30 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
              </div>
              <div className="bg-white p-2 rounded-md  flex items-center">
                <FeatureItem
                  image={
                    <img
                      src={sms}
                      alt="Image1"
                      className="w-30 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
                <Feature
                  title="SMS Notifications"
                  description="Receive timely SMS notifications for upcoming appointments. Knowtify keeps you informed and ensures that you never miss an important meeting with a doctor. Our SMS notification system is designed to provide you with the convenience of instant alerts, allowing you to focus on delivering exceptional healthcare services."
                />
              </div>
            </div>
          </section>

          <section className="mb-2 mx-auto ">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 items-start">
              About Us:
            </h2>
            <div className="bg-white p-0 rounded-md flex items-center ">
              <div className="bg-white p-2 rounded-md  flex items-center">
                <DeveloperItem
                  image={
                    <img
                      src={resume}
                      alt="Image1"
                      className="w-20 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
                <Developer
                  title="Jamie Faye A. Jaime"
                  description="Developer"
                />
              </div>
              <div className="bg-white p-2 rounded-md  flex items-center">
                <DeveloperItem
                  image={
                    <img
                      src={andre}
                      alt="Image1"
                      className="w-20 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
                <Developer
                  title="Andre Joss P. Timmango"
                  description="Developer"
                />
              </div>
              <div className="bg-white p-2 rounded-md  flex items-center">
                <DeveloperItem
                  image={
                    <img
                      src={marj}
                      alt="Image1"
                      className="w-20 h-50 object-cover mb-2 rounded-md"
                    />
                  }
                />
                <Developer title="Marjorie B. Soposop" description="Developer" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
export default Home;
