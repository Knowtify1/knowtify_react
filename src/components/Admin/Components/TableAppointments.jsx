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

const { RangePicker } = DatePicker;

const columns = [
  {
    title: "Name",
    dataIndex: "patientName",
  },
  {
    title: "Appointment Date",
    dataIndex: "dateOfAppointment",
    render: (text, record) => (
      <span>{record.appointmentDate.toDate().toLocaleDateString()}</span>
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
  },
  {
    title: "Type of Doctor",
    dataIndex: "typeOfDoctor",
  },

  {
    title: "Action",
    dataIndex: "action",
    render: (_, record) => (
      <Popconfirm
        title="Are you sure to delete"
        onConfirm={() => handleDelete(record.key)}
        okButtonProps={{ className: "bg-rose-800" }}
      >
        <Button type="link" danger>
          Delete
        </Button>
      </Popconfirm>
    ),
  },
];
// const data = [];
// for (let i = 0; i < 46; i++) {
//   data.push({
//     key: i,
//     name: `Juan Cruz ${i}`,
//     date: `Date. ${i}`,
//     time: `Time. ${i}`,
//     reason: `Reason${i}`,
//   });
// }

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

function TableAppointments() {
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedDate, setSelectedDate] = useState(null);

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
    setSelectedDate(date ? date.toDate() : null);
  };

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex items-cente">
          <h1 className="text-center text-3xl font-medium">Appointments</h1>
          <Space direction="horizontal">
            <h1>Select Appointment Date:</h1>
            <DatePicker onChange={handleDateChange} />
          </Space>

          {loading ? ( // Display loading indicator while data is being fetched
            <Spin size="small" className="block" />
          ) : (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={data}
            />
          )}
        </Space>
      </div>
    </>
  );
}

export default TableAppointments;
