# References:
#   - https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/

from flask import Flask, jsonify, request
import mysql.connector
import json

app = Flask(__name__)

# configure MySQL database
config = {
        'user': 'root',
        'password': 'pwd',
        'host': 'host.docker.internal',
        'port': '3906',
        'database': 'PillPall'
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

#returns all medicaitons in the database
@app.route('/get_all_prescription', methods=['GET'])
def get_all_prescription():
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute('''SELECT * FROM Prescriptions''')
        data = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(data)
    except mysql.connector.Error as e:
        print(str(e), file=sys.stderr)
        return str(e), 500

@app.route('/update_prescription_realm', methods=['PUT'])
def update_prescription_realm():
    data = request.json
    try:
        # Connect to the database and get the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        query = '''UPDATE Prescriptions SET RealmEntry = %s WHERE PrescriptionID = %s'''
        values(data['realmEntry'], data['prescriptionID'])

        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data updated successfully"}), 200
    except mysql.connector.Error as e:
        print(str(e), file=sys.stderr)
        return str(e), 500

@app.route('/add_prescription', methods=['POST'])
def send_to_db_Perscription():
    data = request.json  
    try:
        # Connect to the database and insert the data
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        

        query = "INSERT INTO Prescriptions (PrescriptionID, PatientID, DoctorID, PrescriptionDate, LastModified, RealmEntry) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (data['PrescriptionID'], data['PatientID'], data['DoctorID'], data['PrescriptionDate'], data['LastModified'], json.dumps(data['RealmEntry']))
        
        cursor.execute(query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        return jsonify({"status": "success", "message": "Data added successfully"}), 200
    except mysql.connector.Error as e:
        print(str(e), file=sys.stderr)
        return jsonify({"status": "fail", "message": str(e)}), 500

# run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
