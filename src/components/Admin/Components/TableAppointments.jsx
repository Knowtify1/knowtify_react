import React, { useState } from "react";
import { Table, Popconfirm, Button } from "antd";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Appointment Date",
    dataIndex: "date",
  },
  {
    title: "Appointment Time",
    dataIndex: "time",
  },
  {
    title: "Reason",
    dataIndex: "reason",
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
const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Juan Cruz ${i}`,
    date: `Date. ${i}`,
    time: `Time. ${i}`,
    reason: `Reason${i}`,
  });
}

const handleDelete = (key) => {
  // Implement your logic to delete the appointment with the specified key
  console.log("Deleting key:", key);
};

function TableAppointments() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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

  return (
    <>
      <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
    </>
  );
}

export default TableAppointments;
