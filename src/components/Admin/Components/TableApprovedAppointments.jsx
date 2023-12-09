import React, { useState, useEffect } from "react";
import { Table, Space, Spin, DatePicker, Button } from "antd";
import {
  doc,
  db,
  collection,
  getDocs,
  where,
  query,
  fsTimeStamp,
} from "../../../config/firebase.jsx";

const { RangePicker } = DatePicker;

function TableApprovedAppointments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedDate, setSelectedDate] = useState(null);

  const columns = [
    {
      title: "Name",
      dataIndex: "patientName",
    },
    {
      title: "Appointment Date",
      dataIndex: "dateOfAppointment",
      render: (text, record) => (
        <span>{formatDate(record.appointmentDate)}</span>
      ),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      render: (text) => <span>{text.replace(/"/g, "")}</span>,
    },
    {
      title: "Reason",
      dataIndex: "reasonForAppointment",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span
          className={`inline-block px-2 py-1 rounded border ${
            text === "approved"
              ? "bg-green-500 text-white border-red-400"
              : text === "assigned"
              ? "bg-blue-500 text-white border-blue-400"
              : ""
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Type of Doctor",
      dataIndex: "typeOfDoctor",
    },
    {
      title: "ReferenceID",
      dataIndex: "reference",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) =>
        record.status !== "assigned" && (
          <Space direction="horizontal">
            <Button type="link" onClick={() => handleAssign(record.key)}>
              Assign
            </Button>
          </Space>
        ),
    },
  ];

  const fetchApprovedAppointments = async (
    selectedDate,
    setData,
    setLoading
  ) => {
    try {
      let appointmentsQuery = collection(db, "patients");

      if (selectedDate) {
        // If a date is selected, add a filter based on date
        const startOfDayTimestamp = fsTimeStamp.fromDate(
          new Date(selectedDate.setHours(0, 0, 0, 0))
        );
        const endOfDayTimestamp = fsTimeStamp.fromDate(
          new Date(selectedDate.setHours(23, 59, 59, 999))
        );

        appointmentsQuery = query(
          appointmentsQuery,
          where("appointmentDate", ">=", startOfDayTimestamp),
          where("appointmentDate", "<=", endOfDayTimestamp)
          //where("approved", "===", true)
        );
      }
      // else {
      //   // Add a filter to only fetch appointments with status "Pending"
      //   appointmentsQuery = query(
      //     appointmentsQuery,
      //     where("status", "==", "assigned")
      //   );
      // }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));

      //setData(appointmentsData);
      if (typeof setData === "function") {
        setData(appointmentsData);
        setLoading(false);
      }

      console.error("firebase data", appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  const handleAssign = (key) => {
    console.log("Assigning key:", key);
  };

  useEffect(() => {
    fetchApprovedAppointments(selectedDate, setData, setLoading);
  }, [selectedDate, setData, setLoading]);

  const handleDateChange = (date) => {
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);
    console.log(selectedDate);
    fetchApprovedAppointments(selectedDate, setData, setLoading);
  };

  const getCurrentDateMessage = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString(undefined, options);

    return `Today is ${formattedDate}`;
  };

  const formatDate = (date) => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toDate().toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex items-cente">
          <Space direction="horizontal" size={30}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>Approved Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1> {/* todayis */}
          </Space>

          {loading ? (
            <Spin size="small" className="block" />
          ) : (
            <Table columns={columns} dataSource={data} />
          )}
        </Space>
      </div>
    </>
  );
}

export default TableApprovedAppointments;
