import React, { createContext, useState, useEffect, useContext } from "react";
import { db, collection, getDocs } from "../../../config/firebase";

// Create a Context to hold the global state
const BookingContext = createContext();

// Create a Context Provider component
export const BookingProvider = ({ children }) => {
  // State variables to hold fetched data
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setDoctorTimeOptions] = useState({});
  const [typesOfDoc, setTypesOfDoc] = useState([]);

  // Fetch data function
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "settings"));
      const availabilityData = {};
      const timeOptionsData = {};
      let specialtiesData = [];

      querySnapshot.forEach((doc) => {
        const specialty = doc.data().specialty;
        const specialtyLabel = doc.data().specialtyLabel;
        const days = doc.data().days || [];
        const times = doc.data().times || [];

        specialtiesData = [
          ...specialtiesData,
          { value: specialty, label: specialtyLabel },
        ];
        availabilityData[specialty] = days;
        timeOptionsData[specialty] = times.map((time) => ({
          value: time,
          label: `${time} ${parseInt(time.split(":")[0]) < 12 ? "AM" : "PM"}`,
        }));
      });
      setTypesOfDoc(specialtiesData);
      setDoctorAvailability(availabilityData);
      setDoctorTimeOptions(timeOptionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Context value
  const contextValue = {
    doctorAvailability,
    doctorTimeOptions,
    typesOfDoc,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to consume the global state
export const useBooking = () => {
  return useContext(BookingContext);
};
