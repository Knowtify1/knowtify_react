import React from "react";
import { FireFilled } from "@ant-design/icons";

export const Logo = () => {
  return (
    <div className="logo" style={{ position: "fixed", top: 10, left: 70, padding: "10px" }}>
      <div className="logo-icon">
        <FireFilled />
      </div>
    </div>
  );
};