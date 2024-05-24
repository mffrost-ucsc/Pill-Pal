-- Database Schema Should Go Here
-- Code below right now is just for a test, it can be deleted/altered as needed


CREATE DATABASE PillPall;
USE PillPall;

CREATE TABLE Patients (
    PatientID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(50),
    PASSWORDS VARCHAR(50),
    Phone VARCHAR(50),
    BirthDate DATE,
);

CREATE TABLE Doctors (
    DoctorID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    
);

CREATE TABLE Prescriptions (
    PrescriptionID INT PRIMARY KEY,
    PatientID INT,
    DoctorID INT,
    PrescriptionDate DATE,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (DoctorID) REFERENCES Doctors(DoctorID),
);

CREATE TABLE Reminders (
    ReminderID INT PRIMARY KEY,
    PrescriptionID INT,
    ReminderDate DATE,
    FOREIGN KEY (PrescriptionID) REFERENCES Prescriptions(PrescriptionID)
);

CREATE TABLE AsNeededMedication(
    AsNeededMedicationID INT PRIMARY KEY,
    PrescriptionID INT,
    TimeStampes BIGINT,
    FOREIGN KEY (PrescriptionID) REFERENCES Prescriptions(PrescriptionID)
    
);