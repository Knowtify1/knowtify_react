import React, { useState } from "react";
import { Button, Card, Modal, notification } from "antd";
const { Meta } = Card;
import bookheader from "../../assets/Book/header.jpg";
import clinic from "../../assets/Book/clinic.png";
import general from "../../assets/Book/generl.jpg";
import infectious from "../../assets/Book/infectious.jpg";
import internal from "../../assets/Book/internal.jpg";
import internalmed from "../../assets/Book/internalmed.jpg";
import ob from "../../assets/Book/ob.jpg";
import pedia from "../../assets/Book/pedia.jpg";
import physical from "../../assets/Book/physical.jpg";
import pulmonology from "../../assets/Book/pulmonology.jpg";
import { ConfigProvider } from "antd";
import BookAppointmentForm from "./BookAppointmentForm";

function BookAppointment() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const openNotification = () => {
    notification.success({
      message: 'Appointment Booked',
      description: 'Your appointment has been successfully booked!',
    });
  };

  return (
    <>
      <div className="book_appointment container mx-auto">
        <div className="relative">
          <img
            src={clinic}
            alt="bookheader"
            className="absolute top-0 left-0 max-h-20"
          />
          <img
            src={bookheader}
            alt="bookheader"
            className="w-screen min-h-full"
          />
          <div className="absolute mx-auto bottom-1 p-5 left-1 w-full">
            <div className="bg-black bg-opacity-0 p-3 rounded-md">
              <h1 className="text-sm text-color: #15803d;">
                Elevate Your Health Journey: Seamless Booking, Exceptional Care at
                Mountain Top Specialty Clinic.
              </h1>
              <Button
                onClick={showModal}
                type="primary"
                className="bg-green-600 rounded mt-3"
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <h1 className="text-center">About Us</h1>
          <p className="text-center">
            Your go-to clinic in Baguio City, with specialists in IM, Pedia,
            Pulmo, IDS, Hema, Ortho, OB, & Rehab. Welcome to Mountain Top
            Specialty Clinic, where your health is our priority. Our dedicated
            team of healthcare professionals is committed to providing
            high-quality, compassionate care to our community. At our clinic, we
            offer a range of specialized medical services to address your unique
            healthcare needs. Whether you require routine check-ups, specialized
            treatments, or expert consultations, we are here for you.
          </p>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5" id="bookapp">
          <h1>Book Appointment</h1>
          <Modal
            title="Book Appointment"
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
          >
            <Card>
              <p>
                Ready to prioritize your health? Schedule an appointment with our
                experienced healthcare professionals.
              </p>
              <div className="mt-12 grow">
                <div>
                  <BookAppointmentForm onSuccess={openNotification} onClose={handleCancel} />
                </div>
              </div>
            </Card>
          </Modal>
        </div>

        <div className="pl-8 pr-8 pb-5 pt-5">
          <h1>Contact Us</h1>
          <p>
            <span> 0977 062 5890</span>
            <span> Mountain Top Specialty Clinic</span>
          </p>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <h1>Visit Us at</h1>
          <p>
            101 General Luna Road, Global Multispecialty Diagnostic Center, 2nd
            Floor, Unit 4, Baguio City, Philippines
          </p>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <h1>Our Specialties</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 content-start px-4 sm:px-8 md:px-16 py-10">
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={general} alt="bookheader" className="" />}
            >
              <h2 className="text-center">General Orthopaedic Surgery</h2>
              <p className="text-center">
                Expertise in musculoskeletal conditions.
              </p>
            </Card>
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={internalmed} alt="bookheader" className="" />}
            >
              <h2 className="text-center">Internal Medicine</h2>
              <p className="text-center">
                Specialized care for Adult Diseases.
              </p>
            </Card>
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={internal} alt="bookheader" className="" />}
            >
              <h2 className="text-center">Internal Medicine</h2>
              <p className="text-center">(Adult Hematology)</p>
            </Card>
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={infectious} alt="bookheader" className="" />}
            >
              <h2 className="text-center">Internal Medicine</h2>
              <p className="text-center">(Infectious Diseases)</p>
            </Card>
            
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={ob} alt="bookheader" className="" />}
            >
              <h2 className="text-center">Obstetrics and Gynecology</h2>
              <p className="text-center">
                Women's health and reproductive care.
              </p>
            </Card>
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={pedia} alt="bookheader" className="" />}
            >
              <h2 className="text-center">
                Pediatrics, Vaccines, and Immunizations
              </h2>
              <p className="text-center">
                Specialized care for children's health.
              </p>
            </Card>
            <Card
              hoverable
              className="bg-green-700	text-white p-0"
              cover={<img src={physical} alt="bookheader" className="" />}
            >
              <h2 className="text-center">
                Physical Medicine and Rehabilitation
              </h2>
              <p className="text-center">
                Diagnosis and treatment of skin condition
              </p>
            </Card>
            
            
          </div>
        </div>
      </div>
    </>
  );
}

export default BookAppointment;
