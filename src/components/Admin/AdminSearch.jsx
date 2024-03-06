import { AudioOutlined } from "@ant-design/icons";
import React from "react";
import { Input, Space } from "antd";
const { Search } = Input;
import { SearchOutlined } from "@ant-design/icons";

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: "#1677ff",
    }}
  />
);
const onSearch = (value, _e, info) => console.log(info?.source, value);
function AdminSearch() {
  return (
    <div>
      <Search
        placeholder="Search"
        enterButton={<SearchOutlined />}
        onSearch={(value) => {
          const filteredData = patients.filter((patient) =>
            Object.values(patient)
              .join(" ")
              .toLowerCase()
              .includes(value.toLowerCase())
          );
          setFilteredPatients(sortPatientsByDateTime(filteredData));
        }}
        className="w-60"
      />
    </div>
  );
}

export default AdminSearch;
