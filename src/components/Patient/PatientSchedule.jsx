import React from "react";
import { Calendar, Card } from "antd";



function PatientSchedule() {
  return (
    <div>
      <Card title="Welcome to Patient">
        <h3>
         appointments
        </h3>
        <Calendar></Calendar>
      </Card>
    </div>
    
  );
}

export default PatientSchedule;
