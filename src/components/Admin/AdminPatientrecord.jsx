import React from "react";
import PatientRecords from "./Components/PatientRecords";
import { Card } from "antd";
import { doc, db, collection, } from "../../config/firebase.jsx";

function AdminPatientrecord() {
  return (
    <>
      <div>
            <PatientRecords />
        </div>
    </>
  );
}
export default AdminPatientrecord;
