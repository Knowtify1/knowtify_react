import React, { useState } from "react";
import { Button, Card, Modal, notification } from "antd";
import { Link } from "react-router-dom";
import clinic from "../../assets/Book/clinic.png";
import general from "../../assets/Book/generl.jpg";
import infectious from "../../assets/Book/infectious.jpg";
import internal from "../../assets/Book/internal.jpg";
import internalmed from "../../assets/Book/internalmed.jpg";
import ob from "../../assets/Book/ob.jpg";
import pedia from "../../assets/Book/pedia.jpg";
import physical from "../../assets/Book/physical.jpg";
import pulmonology from "../../assets/Book/pulmonology.jpg";
import doc2 from "../../assets/doc2.png";
import BookAppointmentForm from "./BookAppointmentForm";
import ReCAPTCHA from "react-google-recaptcha";
import phone from "../../assets/phone.svg";
import facebook from "../../assets/facebook.svg";
import bk3 from "../../assets/Book/bk3.jpg";
import bk2 from "../../assets/Book/bk2.jpg";
import bkk3 from "../../assets/Book/bkk3.jpg";
import bkk2 from "../../assets/Book/bkk2.jpg";

function BookAppointment() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const showModal = () => {
    setShowCaptcha(true);
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
    // Show the booking form once captcha is verified
    if (value && !isModalVisible) {
      setIsModalVisible(true);
    }
  };

  const specialties = [
    {
      title: "Our Specialists",
      image: bk3,
      description: "and their expertise",
    },
    {
      title: "General Orthopaedic Surgery",
      image: general,
      description: "Expertise in musculoskeletal conditions.",
    },
    {
      title: "Internal Medicine",
      image: internalmed,
      description: "Specialized care for Adult Diseases.",
    },
    {
      title: "Internal Medicine (Adult Hematology)",
      image: internal,
      description: "Specialized care for Adult Hematology.",
    },
    {
      title: "Internal Medicine (Infectious Diseases)",
      image: infectious,
      description: "Expertise in Infectious Diseases.",
    },
    {
      title: "Internal Medicine (Pulmonology)",
      image: pulmonology,
      description: "Specialized care for Pulmonology.",
    },
    {
      title: "Obstetrics and Gynecology",
      image: ob,
      description: "Women's health and reproductive care.",
    },
    {
      title: "Pediatrics, Vaccines, and Immunizations",
      image: pedia,
      description: "Specialized care for children's health.",
    },
    {
      title: "Physical Medicine and Rehabilitation",
      image: physical,
      description: "Diagnosis and treatment of skin condition.",
    },
  ];

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? specialties.length - 1 : prevSlide - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % specialties.length);
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundImage: `url(${bk2})`,
          backgroundSize: "cover",
          filter: "blur(10px)",
        }}
      />
      <div className="relative w-full h-full">
        <header className="py-4  absolute w-full z-10">
          <div
            style={{ backgroundImage: `url(${bk2})`, filter: "blur(8spx)" }}
          ></div>
          <div className="container mx-auto relative flex items-center justify-between z-10">
            <img
              src={clinic}
              alt="bookheader"
              className="relative top-0 left-10 max-h-10"
            />
            <div className="relative top-0 right-10 max-h-10">
              <Link to="/checkappointment">
                <Button className="mr-4">Check Appointment</Button>
              </Link>
              <Link to="/registerphone">
                <Button className="mr-6 bg-green-600">Login as Patient</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-0 mt-20 p-10">
          <div className="flex">
            <section className="w-full relative">
              <button
                className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-900 bg-opacity-50 text-white p-2 rounded-full z-10"
                onClick={prevSlide}
              >
                {"<"}
              </button>
              <button
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-900 bg-opacity-50 text-white p-2 rounded-full z-10"
                onClick={nextSlide}
              >
                {">"}
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 content-start px-4 sm:px-8 md:px-16 py-10 relative z-0">
                {specialties.map((specialty, index) => (
                  <div
                    key={index}
                    className={`transition-transform duration-300 transform ${
                      index === currentSlide
                        ? "scale-110" // Increase scale for the current slide
                        : index === currentSlide - 1 ||
                          index === currentSlide + 1
                        ? "scale-90"
                        : "hidden"
                    }`}
                    style={{
                      width: "200%",
                      height: "100%",
                      zIndex: index === currentSlide ? 1 : 0,
                    }}
                  >
                    <Card
                      hoverable
                      className={`bg-green-700 text-white p-0 ${
                        index === currentSlide ? "h-full" : "h-96" // Adjust height for the current slide
                      }`}
                      style={{ width: "100%", height: "100%" }}
                      cover={
                        <img
                          src={specialty.image}
                          alt="bookheader"
                          style={{ width: "100%", height: "100%" }}
                        />
                      }
                    >
                      <h2 className="text-center">{specialty.title}</h2>
                      <p className="text-center">{specialty.description}</p>
                      <div className="text-center text-gray-400">
                        {index}/{specialties.length - 1}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
            <div className="ml-8 mt-40">
              <h1 className="text-3xl lg:text-4xl font-bold text-green-900 text-left mb-5">
                Elevate Your Health Journey: <br /> Seamless Booking,
                Exceptional Care at Mountain Top Specialty Clinic.
              </h1>
              <div className="lg:w-1/2 flex justify-left">
                {showCaptcha && (
                  <ReCAPTCHA
                    sitekey="6LdxRU8pAAAAAPtTPMi4pwlsanI-7R96R7SvkP8k"
                    onChange={handleCaptchaChange}
                  />
                )}
                {!showCaptcha && (
                  <Button
                    className="bg-green-600 rounded mt-3 ml-3"
                    onClick={showModal}
                    type="primary"
                  >
                    Book Appointment
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 p-10">
            <Card className="shadow-md p-4">
              <h1 className="text-2xl font-bold text-green-600 ">
                Booking Guide
              </h1>
              <p>
                Watch{" "}
                <a
                  href="https://youtu.be/dUFS8js-WNw"
                  className="text-blue-500 mt-2 inline-block"
                >
                  knowtify walkthrough
                </a>{" "}
                or follow this step-by-step guide.
              </p>
            </Card>
            <Card className="shadow-md p-4">
              <h1 className="text-2xl font-bold text-green-600 ">Contact Us</h1>
              <p>
                <a
                  href="tel:09770625890 "
                  className=" text-blue-500 flex  items-center"
                >
                  <img src={phone} className="w-6 h-6 mr-2" alt="Phone" />
                  <span>0977 062 5890</span>
                </a>
                <br />
                <a
                  href="https://www.facebook.com/MountainTopClinic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" text-blue-500 flex items-center"
                >
                  <img src={facebook} className="w-6 h-6 mr-2" alt="Facebook" />
                  <span>Mountain Top Specialty Clinic</span>
                </a>
              </p>
            </Card>
            <Card className="shadow-md p-4">
              <h1 className="text-2xl font-bold text-green-600 ">
                Visit Us at
              </h1>
              <p>
                101 General Luna Road, Global Multispecialty Diagnostic Center,
                2nd Floor, Unit 4, Baguio City, Philippines
              </p>
              <div className="mt-4">
                <iframe
                  title="Mountain Top Specialty Clinic Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.1984711044047!2d120.59160181536767!3d16.404783088611607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391a202b9444b23%3A0xf2feeb92eb6997a2!2sMountain%20Top%20Specialty%20Clinic!5e0!3m2!1sen!2sph!4v1646788734556!5m2!1sen!2sph"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </Card>

            <Card className="shadow-md p-4">
              <h1 className="text-2xl font-bold text-green-600">
                We also offer
              </h1>
              <p>Additional services.</p>

              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <img src={bkk2} alt="Health Ad 1" className="mb-2" />
                    <h3 className="text-lg font-semibold">Immunizations</h3>
                    <p>Description of the health ad 1.</p>
                    <a
                      href="https://www.facebook.com/photo/?fbid=839797198179672&set=a.627139002778827"
                      className="text-blue-500 mt-2 inline-block"
                    >
                      Learn More
                    </a>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <img src={bkk3} alt="Health Ad 2" className="mb-2" />
                    <h3 className="text-lg font-semibold">Vaccines</h3>
                    <p>2024 Flu Vaccines</p>
                    <a
                      href="https://www.facebook.com/photo/?fbid=322458357477435&set=a.111012565288683"
                      className="text-blue-500 mt-2 inline-block"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <main className="container mx-30 mt-40 px-40 flex flex-col items-center">
          <section>
            <div className="container mx-auto lg:pl-8 lg:pr-8 lg:pb-5 lg:pt-30">
              <Modal
                title="Book Appointment"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
              >
                <Card>
                  <p>
                    Ready to prioritize your health? Schedule an appointment
                    with our experienced healthcare professionals.
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default BookAppointment;
