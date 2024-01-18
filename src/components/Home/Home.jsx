import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Card, Button } from 'antd';
import { UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import knowtifylogo from "../../assets/knowtifylogo.png";
import knowtifylogov2 from "../../assets/knowtifymod.svg";
import doc from "../../assets/doc.png";
import pat from "../../assets/pat.png";



function Home() {
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
      navigate("/patienthome");
    } else if (type === "doctor") {
      navigate("/login");
    }
  };

  useEffect(() => {
    // Handle userType state as needed
    console.log("User type selected:", userType);
  }, [userType]);

  const cardStyle = {
    width: 400,
    cursor: 'pointer',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div className="min-h-screen">
      <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="User Type Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          backgroundColor: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
        },
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '1.5rem' }}>Choose your role:</p>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Card
          title="I am a Patient"
          style={cardStyle}
          onClick={() => handleUserTypeSelection('patient')}
          cover={<img src={pat} alt="bookheader" className="" />}
        >
        </Card>


        <Card
          title="I am a Doctor"
          style={cardStyle}
          onClick={() => handleUserTypeSelection('doctor')}
          cover={<img src={doc} alt="bookheader" className="" />}
        >
        </Card>
          </div>
          </div>
    </Modal>

      <header className="bg-white py-4 shadow">
        <div className="container mx-auto flex items-center justify-between">
          <img src={knowtifylogov2} alt="knowtifylogo" className="h-12" />
        </div>
      </header>

      <main className="container mx-auto mt-10">
        <section className="text-center">
          <p className="text-lg text-gray-600 mb-8">
            Simplifying your schedule notifications. Knowtify keeps doctors
            informed about their upcoming appointments with ease.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Key Features:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Integrated EMR"
              description="Access Electronic Medical Records seamlessly."
            />
            <FeatureCard
              title="Dynamic Calendar"
              description="Manage appointments and schedules with ease."
            />
            <FeatureCard
              title="Email Notifications"
              description="Receive timely email notifications for upcoming appointments."
            />
            {/* Add more features here */}
          </div>
        </section>
      </main>
    </div>
  );
}

// A simple reusable component for feature cards
const FeatureCard = ({ title, description }) => (
  <div className="bg-gray-200 p-6 rounded-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
