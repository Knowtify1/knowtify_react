import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Button, Space, Spin, DatePicker } from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  where,
  query,
  fsTimeStamp,
  deleteDoc,
} from "../../../config/firebase.jsx";

function TablePendingAppointments() {
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
            text === "pending" ? "bg-red-600 text-white border-red-400" : ""
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
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleApprove(record.key)}>
            Approve
          </Button>
          <Popconfirm
            title="Are you sure to delete"
            onConfirm={() =>
              handleDelete(record.key, setData, setLoading, selectedDate)
            }
            okButtonProps={{ className: "bg-rose-800" }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleApprove = async (key) => {
    try {
      const appointmentRef = doc(db, "appointments", key);
      // Update the status to 'Approved'
      await setDoc(appointmentRef, { status: "approved" }, { merge: true });
      console.log(`Appointment ${key} approved.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    try {
      const appointmentRef = doc(db, "appointments", key);

      // Fetch the appointment data
      const appointmentSnapshot = await getDoc(appointmentRef);
      const appointmentData = appointmentSnapshot.data();

      // Move the data to the "patient" collection
      await addDoc(collection(db, "patients"), appointmentData);

      // Delete the document from the original "appointments" collection
      await deleteDoc(appointmentRef);

      // Fetch updated appointments data
      fetchAppointments(selectedDate, setData, setLoading);

      console.log(`Appointment ${key} approved and transferred to patients.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    // Fetch updated appointments data
    fetchAppointments(selectedDate, setData, setLoading);
  };

  const moveDataToTrash = async (originalCollection, trashCollection, key) => {
    try {
      // Get the document from the original collection
      const originalDocRef = doc(originalCollection, key);
      const originalDocSnapshot = await getDoc(originalDocRef);
      const dataToMove = originalDocSnapshot.data();

      // Add the document to the trash collection
      const trashDocRef = await addDoc(
        collection(db, trashCollection),
        dataToMove
      );

      // Delete the document from the original collection
      await deleteDoc(originalDocRef);

      console.log(
        `Moved to trash. Original key: ${key}, Trash key: ${trashDocRef.id}`
      );
    } catch (error) {
      console.error("Error moving data to trash:", error);
    }
  };

  // Function to fetch appointments from Firestore
  const fetchAppointments = async (selectedDate, setData, setLoading) => {
    try {
      let appointmentsQuery = collection(db, "appointments");

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
        );
      }

      // Add a filter to only fetch appointments with status "Pending"
      // appointmentsQuery = query(
      //   appointmentsQuery,
      //   where("status", "==", "pending")
      // );

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

  const handleDelete = async (key, setData, setLoading, selectedDate) => {
    // Implement your logic to delete the appointment with the specified key
    console.log("Deleting key:", key);

    try {
      // Move the data to the "trash" collection
      await moveDataToTrash(
        collection(db, "appointments"),
        "deletedAppointment",
        key
      );
      console.log("Success moving to deletedappointment");
      // Update the component's state to trigger a re-render
      if (typeof setData === "function" && typeof setLoading === "function") {
        setData((prevData) => {
          const updatedData = prevData.filter((item) => item.key !== key);
          console.log("Updated Data:", updatedData);
          return updatedData;
        });
      }

      fetchAppointments(selectedDate, setData, setLoading);
      // After moving to trash, fetch the updated appointments data
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  useEffect(() => {
    // Fetch appointments when the component mounts
    fetchAppointments(selectedDate, setData, setLoading);
  }, [selectedDate, setData, setLoading]); // Empty dependency array to fetch data only once when the component mounts

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  const handleDateChange = (date) => {
    // Convert to native JavaScript Date if date is not null
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);

    // Fetch appointments based on the selected date
    fetchAppointments(selectedDate, setData, setLoading);
  };

  const formatDate = (date) => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toDate().toLocaleDateString(undefined, options);
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

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex items-cente">
          <Space direction="horizontal" size={40}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>Pending Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1> {/* todayis */}
          </Space>

          {loading ? ( // Display loading indicator while data is being fetched
            <Spin size="small" className="block" />
          ) : (
            <Table
              // rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
            />
          )}
        </Space>
      </div>
    </>
  );
}

export default TablePendingAppointments;
