import React, { useState } from "react";
import { Button, Form, Input, Space, Tooltip, Typography, Row, Col } from 'antd';


const onFinish = (values) => {
  console.log('Received values of form: ', values);
  // Add logic to handle form submission and data storage/syncing
};

const DoctorAppointment = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ maxWidth: 900 }}>
      <Form
        name="emr-form"
        onFinish={onFinish}
        labelCol={{
          span: 24,
        }}
        wrapperCol={{
          span: 24,
        }}
        layout="horizontal"
      >
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item label="Patient ID (Reference)" name="patientId">
              <Space>
                <Input
                  style={{
                    width: 260,
                  }}
                  placeholder="Enter Patient ID"
                />
                <Tooltip title="Retrieve patient data using ID">
                  <Typography.Link href="#API">Lookup Patient</Typography.Link>
                </Tooltip>
              </Space>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Emergency Contacts" name="emergencyContacts">
              <Input
                style={{
                  width: 260,
                }}
                placeholder="Enter Name"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Past illnesses or conditions" name="pastIllnessesConditions">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Enter Past illnesses or conditions"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="Surgeries or medical procedures" name="surgeriesMedicalProcedures">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Enter Surgeries or medical procedures"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Allergies" name="allergies">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Allergies"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Blood pressure" name="bloodPressure">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Blood pressure"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="Respiratory rate" name="respiratoryRate">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Respiratory rate"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Clinical Notes" name="clinicalNotes">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Clinical Notes"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Diagnostic Test Results" name="diagnosticTestResults">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Diagnostic Test Results"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="Follow-up Appointments" name="followUpAppointments">
              <Input.TextArea
                style={{
                  width: 260,
                }}
                placeholder="Follow-up Appointments"
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item label=" " colon={false}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  </div>
);


export default DoctorAppointment;
