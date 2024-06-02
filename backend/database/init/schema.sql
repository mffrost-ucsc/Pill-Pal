-- Database Schema

CREATE DATABASE PillPal;
USE PillPal;

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(50) NOT NULL,
    PasswordHash BINARY(64) NOT NULL
);

CREATE TABLE Medications (
    MedicationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Dosage INT NOT NULL DEFAULT 1,
    Frequency CHAR NOT NULL DEFAULT 'a', -- [d]aily,[w]eekly,[a]s needed
    TimesPerInterval INT NOT NULL DEFAULT 1,
    AdditionalInfo VARCHAR(200),
    Modified TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Reminders (
    ReminderID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MedicationID INT NOT NULL,
    Hour INT NOT NULL,
    Minute INT NOT NULL,
    Day CHAR(2), -- Su, Mo, Tu, We, Th, Fr, Sa
    Modified TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (MedicationID) REFERENCES Medications(MedicationID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE Logs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Amount INT NOT NULL,
    Time TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
