# References:
#   - https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/

from flask import Flask, jsonify, request
import mysql.connector

app = Flask(__name__)

# configure MySQL database
config = {
        'user': 'root',
        'password': 'pwd',
        'host': 'host.docker.internal',
        'port': '3906',
        'database': 'PillPal'
    }

# test route
@app.route('/test', methods=['GET'])
def testing():
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor(dictionary=True)
    cursor.execute('''SELECT * FROM PillPall''')
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

@app.route('/add_user', methods=['POST'])
def send_to_db_user():
    data = request.json  
    try:
        # Connect to the database and insert the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        

        values = (data['column1'], data['column2'])
        query = "INSERT INTO Patients (PatientID, FirstName,LastName,Email,PASSWORDS ,Phone,BirthDate) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        values = (data['PatientID'], data['FirstName'], data['LastName'], data['Email'], data['PASSWORDS'], data['Phone'], data['BirthDate'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data added successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/add_Perscription', methods=['POST'])
def send_to_db_Perscription():
    data = request.json  
    try:
        # Connect to the database and insert the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        

        query = "INSERT INTO Perscription (PrescriptionID, PatientID, DoctorID,PrescriptionDate,  ) VALUES (%s, %s, %s, %s, %s)"
        values = (data ['PrescriptionID'], data['PatientID'], data['DoctorID'], data['PrescriptionDate'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data added successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/add_doctors', methods=['POST'])
def send_to_db_Doctors():
    data = request.json  
    try:
        # Connect to the database and insert the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        

        query = "INSERT INTO Doctors (DoctorID, FirstName,LastName) VALUES (%s, %s, %s)"
        values = (data['DoctorID'], data['FirstName'], data['LastName'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data added successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/edit_Perscription', methods=['PUT'])
def edit_Perscription():
    data = request.json
    try:
        # Connect to the database and update the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "UPDATE Perscription SET PrescriptionID = %s, PatientID = %s, DoctorID = %s, PrescriptionDate = %s WHERE PrescriptionID = %s"
        values = (data['PrescriptionID'], data['PatientID'], data['DoctorID'], data['PrescriptionDate'], data['PrescriptionID'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/edit_user', methods=['PUT'])
def edit_user():
    data = request.json
    try:
        # Connect to the database and update the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "UPDATE Patients SET PatientID = %s, FirstName = %s, LastName = %s, Email = %s, PASSWORDS = %s, Phone = %s, BirthDate = %s WHERE PatientID = %s"
        values = (data['PatientID'], data['FirstName'], data['LastName'], data['Email'], data['PASSWORDS'], data['Phone'], data['BirthDate'], data['PatientID'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/edit_doctors', methods=['PUT'])
def edit_doctors():
    data = request.json
    try:
        # Connect to the database and update the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "UPDATE Doctors SET DoctorID = %s, FirstName = %s, LastName = %s WHERE DoctorID = %s"
        values = (data['DoctorID'], data['FirstName'], data['LastName'], data['DoctorID'])
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/delete_user', methods=['DELETE'])
def delete_user():
    data = request.json
    try:
        # Connect to the database and delete the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "DELETE FROM Patients WHERE PatientID = %s"
        values = (data['PatientID'],)
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/delete_Perscription', methods=['DELETE'])
def delete_Perscription():
    data = request.json
    try:
        # Connect to the database and delete the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "DELETE FROM Perscription WHERE PrescriptionID = %s"
        values = (data['PrescriptionID'],)
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/delete_doctors', methods=['DELETE'])
def delete_doctors():
    data = request.json
    try:
        # Connect to the database and delete the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        query = "DELETE FROM Doctors WHERE DoctorID = %s"
        values = (data['DoctorID'],)
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/get_user', methods=['GET'])
def get_user():
    data = request.json
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM Patients WHERE PatientID = %s"
        values = (data['PatientID'],)
        
        cursor.execute(query, values)
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/get_Perscription', methods=['GET'])
def get_Perscription():
    data = request.json
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM Perscription WHERE PrescriptionID = %s"
        values = (data['PrescriptionID'],)
        
        cursor.execute(query, values)
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/get_doctors', methods=['GET'])
def get_doctors():
    data = request.json
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM Doctors WHERE DoctorID = %s"
        values = (data['DoctorID'],)
        
        cursor.execute(query, values)
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/get_all_users', methods=['GET'])
def get_all_users():
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Patients")
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/get_all_Perscription', methods=['GET'])
def get_all_Perscription():
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Perscription")
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500
    
@app.route('/get_all_doctors', methods=['GET'])
def get_all_doctors():
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Doctors")
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

def As_needed_medication():
    data = request.json
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM Perscription WHERE PrescriptionID = %s"
        values = (data['PrescriptionID'],)
        
        cursor.execute(query, values)
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


# run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
