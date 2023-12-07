import React from "react";
import knowtifylogo from "../../assets/knowtifylogo.png";

function Home() {
  return (
    <div className="text-center mt-10">
      <img
        src={knowtifylogo}
        alt="knowtifylogo"
        className="mx-auto max-w-full h-auto mb-4"
      />

      <div className="bg-black bg-opacity-30 p-6 rounded-md">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Mountain Top Specialty Clinic
        </h1>
        <p className="text-lg text-white bg-black bg-opacity-30 p-6 rounded-md">
          Your go-to clinic in Baguio City, with specialists in Internal
          Medicine, Pediatrics, Pulmonology, Obstetrics and Gynecology, and more.
          At Mountain Top Specialty Clinic, your health is our priority.
        </p>
        <p className="text-lg text-white mt-4 bg-black bg-opacity-30 p-6 rounded-md">
          Our dedicated team of healthcare professionals is committed to
          providing high-quality, compassionate care to our community. Whether
          you need routine check-ups, specialized treatments, or expert
          consultations, we are here for you.
        </p>
        <p className="text-lg text-white mt-4 bg-black bg-opacity-30 p-6 rounded-md">
          Ready to prioritize your health? Schedule an appointment with our
          experienced healthcare professionals and embark on a seamless and
          exceptional health journey.
        </p>
      </div>
    </div>
  );
}

export default Home;
