-- Database Schema Should Go Here
-- Code below right now is just for a test, it can be deleted/altered as needed


CREATE DATABASE PillPal;
USE PillPal;

CREATE TABLE Patients (
    PatientID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(50),
    PasswordHash BINARY(64)
);

INSERT INTO Patients VALUES (
    1234,
    "Simon",
    "Barkehanai",
    "sbarkeha@ucsc.edu",
    X'a2c7ef5760b6d879bedf74dc40aadd7cd397e6d3975e17047df1a6b77164fcc1381fef28a69a0ea16a5fc64ca53a58acfc631e03b54c2676ac50ea577d8b10f3' -- pw='foobar', salt='salt'
);

CREATE TABLE Doctors (
    DoctorID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(50),
    Phone VARCHAR(50)
);

CREATE TABLE Prescriptions (
    PrescriptionID INT PRIMARY KEY,
    PatientID INT,
    DoctorID INT,
    PrescriptionDate DATE,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (DoctorID) REFERENCES Doctors(DoctorID)
);

CREATE TABLE Reminders (
    ReminderID INT PRIMARY KEY,
    PrescriptionID INT,
    ReminderDate DATE,
    FOREIGN KEY (PrescriptionID) REFERENCES Prescriptions(PrescriptionID)
);
