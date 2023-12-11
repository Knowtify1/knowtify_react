import React from "react";
import { Link } from "react-router-dom";
import knowtifylogo from "../../assets/knowtifylogo.png";
import knowtifylogov2 from "../../assets/knowtifymod.svg";

function Home() {
  return (
    <div className="min-h-screen">
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
