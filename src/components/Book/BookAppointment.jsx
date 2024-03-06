import React, { useState } from "react";
import { Button, Card, Modal, notification } from "antd";
import { ConfigProvider } from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import BookAppointmentForm from "./BookAppointmentForm";
import bookheader from "../../assets/Book/header.jpg";
import clinic from "../../assets/Book/clinic.png";
import bk from "../../assets/Book/bk.jpg";
import general from "../../assets/Book/generl.jpg";
import infectious from "../../assets/Book/infectious.jpg";
import internal from "../../assets/Book/internal.jpg";
import internalmed from "../../assets/Book/internalmed.jpg";
import ob from "../../assets/Book/ob.jpg";
import pedia from "../../assets/Book/pedia.jpg";
import physical from "../../assets/Book/physical.jpg";
import pulmonology from "../../assets/Book/pulmonology.jpg";
import { Link } from "react-router-dom";

function BookAppointment() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setShowCaptcha(false);
    setIsModalVisible(false);
  };

  const openNotification = () => {
    notification.success({
      message: "Appointment Booked",
      description: "Your appointment has been successfully booked!",
    });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    // Show the reason selection once captcha is verified
    if (value && !showCaptcha) {
      setShowCaptcha(true);
    }
  };

  return (
    <ConfigProvider>
      <header className="bg-white py-4 shadow fixed w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <img
            src={clinic}
            alt="bookheader"
            className="relative top-0 left-10 max-h-10"
          />
          <div className="relative top-0 right-10 max-h-10">
            {/* Add your login/sign-up button */}
            <Link to="/checkappointment">
              <Button className="mr-4">Check Appointment</Button>
            </Link>
            <Link to="/login">
              <Button className="mr-4">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="mr-6 bg-green-600">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <div>
        <div className="relative">
          <img
            src={bk}
            alt="bookheader"
            className="w-100 max-h-97 blur"
            style={{ filter: "blur(4px)" }} // Adjust the blur value as needed
          />
          <div className="absolute bottom-40 p-20 ">
            <div>
              <h1 className="text-4xl font-bold text-green-900 ">
                Elevate Your Health Journey: <br></br>
                Seamless Booking, Exceptional Care at Mountain Top Specialty
                Clinic.
              </h1>
              {showCaptcha && (
                <ReCAPTCHA
                  sitekey="6LdxRU8pAAAAAPtTPMi4pwlsanI-7R96R7SvkP8k"
                  onChange={handleCaptchaChange}
                />
              )}
              <Button
                onClick={showModal}
                type="primary"
                className="bg-green-600 rounded mt-3"
              >
                Book Appointment
              </Button>
              {!showCaptcha && (
                <p
                  className="text-sm text-green-600 mt-5 cursor-pointer underline"
                  onClick={() => setShowCaptcha(true)}
                >
                  Click here to verify and book an appointment.
                </p>
              )}
              {!captchaValue && showCaptcha && (
                <p className="text-red-500 mt-2">
                  Please complete the captcha before proceeding with the
                  booking.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Modal
            title="Book Appointment"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
          >
            <Card>
              <p>
                Ready to prioritize your health? Schedule an appointment with
                our experienced healthcare professionals.
              </p>
              <div className="mt-12 grow">
                <div>
                  <BookAppointmentForm
                    onSuccess={openNotification}
                    onClose={handleCancel}
                  />
                </div>
              </div>
            </Card>
          </Modal>
        </div>

        <div className="pl-8 pr-8 pb-5 pt-5">
          <h1 className="text-2xl font-bold text-green-600 ">
            Our Specialties
          </h1>
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
              cover={<img src={pulmonology} alt="bookheader" className="" />}
            >
              <h2 className="text-center">Internal Medicine</h2>
              <p className="text-center">(Pulmonology)</p>
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
          <div className="pl-8 pr-8 pb-5 pt-5">
            <h1 className="text-2xl font-bold text-green-600 ">Contact Us</h1>
            <p>
              <span> 0977 062 5890</span>
              <span> Mountain Top Specialty Clinic</span>
            </p>
          </div>
          <div className="pl-8 pr-8 pb-5 pt-5">
            <h1 className="text-2xl font-bold text-green-600 ">Visit Us at</h1>
            <p>
              101 General Luna Road, Global Multispecialty Diagnostic Center,
              2nd Floor, Unit 4, Baguio City, Philippines
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default BookAppointment;
