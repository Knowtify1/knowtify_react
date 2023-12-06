// AdminHome.jsx
import React from "react";
import PediatricsCard from "../Admin/CardComponents/PediatricsCard";
import InfectiousDiseaseCard from "../Admin/CardComponents/InfectiousCard";
import HematologyCard from "../Admin/CardComponents/HematologyCard";
import PulmonologyCard from "../Admin/CardComponents/PulmonologyCard";
import AdultDiseaseCard from "../Admin/CardComponents/AdultDiseaseCard"; // Updated import
import GynoCard from "../Admin/CardComponents/GynoCard";
import OrthoCard from "../Admin/CardComponents/OrthoCard";
import RehabCard from "../Admin/CardComponents/RehabCard";

function AdminHome() {
  const handleCalendarClick = (specialty) => {
    console.log(`Calendar button clicked for ${specialty}`);
    // Implement your logic here
  };

  const handleAppointmentsClick = (specialty) => {
    console.log(`Appointments button clicked for ${specialty}`);
    // Implement your logic here
  };

  const handleNotificationsClick = (specialty) => {
    console.log(`Notifications button clicked for ${specialty}`);
    // Implement your logic here
  };

  return (
    <>
      <div className="admin_home">
        <div className="relative">
          <div className="h-56 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 content-start px-4 sm:px-8 md:px-16 py-10">
            {/* Use the PediatricsCard component */}
            <PediatricsCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
            {/* Use the InfectiousDiseaseCard component */}
            <InfectiousDiseaseCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
            {/* Use the HematologyCard component */}
            <HematologyCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
            {/* Use the PulmonologyCard component */}
            <PulmonologyCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
            {/* Use the AdultDiseaseCard component */}
            <AdultDiseaseCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
            {/* Use the GynoCard component */}
            <GynoCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />

            {/* Use the OrthoCard component */}
            <OrthoCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />

            {/* Use the RehabCard component */}
            <RehabCard
              handleCalendarClick={handleCalendarClick}
              handleAppointmentsClick={handleAppointmentsClick}
              handleNotificationsClick={handleNotificationsClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
