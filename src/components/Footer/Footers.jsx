import React from "react";
import { Layout } from "antd";
import {
  GithubOutlined,
  MailOutlined,
  FacebookOutlined,
  GoogleOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import "tailwindcss/tailwind.css";

const { Footer } = Layout;

function CustomFooter() {
  return (
    <Footer className="bg-green-500 text-white text-center py-4">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="mx-4">
            <a
              href="https://github.com/your-github-username"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubOutlined style={{ fontSize: "24px" }} />
            </a>
          </div>
          <div className="mx-4">
            <a href="mailto:your.email@example.com">
              <MailOutlined style={{ fontSize: "24px" }} />
            </a>
          </div>
          <div className="mx-4">
            <a
              href="https://www.facebook.com/your-facebook-page"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookOutlined style={{ fontSize: "24px" }} />
            </a>
          </div>
          <div className="mx-4">
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleOutlined style={{ fontSize: "24px" }} />
            </a>
          </div>
          <div className="mx-4">
            <PhoneOutlined style={{ fontSize: "24px" }} />
          </div>
        </div>
        <div className="text-left">
          <p>
            &copy; 2023 Knowtify. Created by UC Students
            <br />
            Follow Us:{" "}
            <a
              href="https://github.com/your-github-username"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubOutlined style={{ fontSize: "16px" }} />
            </a>{" "}
            <a href="mailto:your.email@example.com">
              <MailOutlined style={{ fontSize: "16px" }} />
            </a>{" "}
            <a
              href="https://www.facebook.com/your-facebook-page"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookOutlined style={{ fontSize: "16px" }} />
            </a>{" "}
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleOutlined style={{ fontSize: "16px" }} />
            </a>
          </p>
          <p>
            <a href="/contact">
              <PhoneOutlined style={{ fontSize: "16px" }} /> Contact Us
            </a>{" "}
            |{" "}
            <a href="/help">
              <QuestionCircleOutlined style={{ fontSize: "16px" }} /> Help
            </a>{" "}
            |{" "}
            <a href="/about">
              <InfoCircleOutlined style={{ fontSize: "16px" }} /> About
            </a>{" "}
            |{" "}
            <a href="/terms">
              <FileTextOutlined style={{ fontSize: "16px" }} /> Terms of Service
            </a>{" "}
            |{" "}
            <a href="/privacy">
              <SafetyCertificateOutlined style={{ fontSize: "16px" }} /> Privacy
              Policy
            </a>
          </p>
        </div>
      </div>
    </Footer>
  );
}

export default CustomFooter;
