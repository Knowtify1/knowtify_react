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
  const [loading, setLoading] = useState(true);
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
      title: "ReferenceID",
      dataIndex: "reference",
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
            title="Are you sure to Reschedule?"
            onConfirm={() =>
              handleDelete(record.key, setData, setLoading, selectedDate)
            }
            okButtonProps={{ className: "bg-rose-800" }}
          >
            <Button type="link" danger>
              Reschedule
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleApprove = async (key) => {
    try {
      const appointmentRef = doc(db, "appointments", key);
      await setDoc(
        appointmentRef,
        { status: "approved" },
        { merge: true },
        { approved: true }
      );
      console.log(`Appointment ${key} approved.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    try {
      const appointmentRef = doc(db, "appointments", key);
      const appointmentSnapshot = await getDoc(appointmentRef);

      const appointmentData = appointmentSnapshot.data(); // Store data for transfer to patients

      await addDoc(collection(db, "patients"), appointmentData); // Store data on patients

      await deleteDoc(appointmentRef); // Delete Data into appointments

      fetchAppointments(selectedDate, setData, setLoading);

      console.log(`Appointment ${key} approved and transferred to patients.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    fetchAppointments(selectedDate, setData, setLoading);
  };

  const moveDataToTrash = async (originalCollection, trashCollection, key) => {
    try {
      const originalDocRef = doc(originalCollection, key);
      const originalDocSnapshot = await getDoc(originalDocRef);
      const dataToMove = originalDocSnapshot.data();

      const trashDocRef = await addDoc(
        collection(db, trashCollection),
        dataToMove
      );

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

      const appointmentsData = appointmentsSnapshot.docs
        .map((doc) => ({ key: doc.id, ...doc.data() }))
        .sort((a, b) => a.appointmentDate - b.appointmentDate);

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
    console.log("Deleting key:", key);

    try {
      await moveDataToTrash(
        collection(db, "appointments"),
        "deletedAppointment",
        key
      );
      console.log("Success moving to deletedappointment");
      if (typeof setData === "function" && typeof setLoading === "function") {
        setData((prevData) => {
          const updatedData = prevData.filter((item) => item.key !== key);
          console.log("Updated Data:", updatedData);
          return updatedData;
        });
      }

      fetchAppointments(selectedDate, setData, setLoading);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate, setData, setLoading);
  }, [selectedDate, setData, setLoading]);

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
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);

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
        <Space direction="vertical" size={20} className="flex">
          <Space direction="horizontal" size={40}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>Pending Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1> {/* todayis */}
          </Space>

          {loading ? (
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
