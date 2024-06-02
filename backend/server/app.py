# References:
#   - https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask import Flask, jsonify, request
from datetime import datetime
import mysql.connector
import bcrypt
import sys

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
jwt = JWTManager(app)

# configure MySQL database
config = {
        'user': 'root',
        'password': 'pwd',
        'host': 'database',
        'port': '3306',
        'database': 'PillPal'
    }

def now_str():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def hashpw(pword):
    salt = b'salt'
    if isinstance(pword, str):
        pword = pword.encode('utf-8')
    return bcrypt.kdf(password=pword,
                      salt=salt,
                      desired_key_bytes=64,
                      rounds=100)

def checkpw(db_pword, pword):
    return db_pword == hashpw(pword)

def exec_sql(query, values=None, commit=False, last_insert_id=False):
    cnx = mysql.connector.connect(**config)
    if cnx.is_connected():
        with cnx.cursor(dictionary=True) as cursor:
            cursor.execute(query, values)
            rows = cursor.fetchall()
            if last_insert_id:
                cursor.execute("SELECT LAST_INSERT_ID()")
                rows = cursor.fetchall()[0]['LAST_INSERT_ID()']
        if commit:
            cnx.commit()
        cnx.close()
        return rows
    else:
        return None

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    uname = data['username']
    pword = data['password']
    query = '''SELECT UserID,PasswordHash FROM Users WHERE Email = %s'''
    values = (uname,)
    row = exec_sql(query, values)

    if row and checkpw(row[0]['PasswordHash'], pword.encode()):
        token = create_access_token(identity=row[0]['UserID'])
        return jsonify({'message': 'Login Success', 'token': token})
    else:
        return jsonify({'message': 'Login Failed'}), 401

@app.route('/name', methods=['GET'])
@jwt_required()
def name():
    uid = get_jwt_identity()
    query = '''SELECT FirstName,LastName FROM Users WHERE UserID = %s'''
    values = (uid,)
    row = exec_sql(query, values)[0]
    return row['FirstName'] + ' ' + row['LastName']

@app.route('/user', methods=['PUT'])
def add_user():
    data = request.json
    rows = exec_sql('SELECT UserID FROM Users WHERE Email = %s', (data['Email'],))
    if len(rows) != 0:
        return jsonify({"status": "fail", "message": "Error: user already exists"})
    try:
        query = '''INSERT INTO Users(FirstName, LastName, Email, PasswordHash) VALUES (%s, %s, %s, %s)'''
        values = (data['FirstName'], data['LastName'], data['Email'], hashpw(data['Password']))
        exec_sql(query, values, commit=True)
        return jsonify({"status": "success", "message": "User added successfully"}), 201
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/user', methods=['POST'])
@jwt_required()
def update_user():
    uid = get_jwt_identity()
    data = request.json
    try:
        query = 'UPDATE Users SET '
        values = []

        for field in ['FirstName', 'LastName', 'Email']:
            if field in data:
                query += field + ' = %s, '
                values.append(data[field])
        if 'Password' in data:
            query += 'PasswordHash = %s, '
            values.append(hashpw(data['Password']))
        query = query[:-2]
        query += ' WHERE UserID = %s'
        values.append(uid)
        exec_sql(query, tuple(values), commit=True)
        return jsonify({"status": "success", "message": "User data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/user', methods=['DELETE'])
@jwt_required()
def delete_user():
    uid = get_jwt_identity()

    try:
        query = 'DELETE FROM Users WHERE UserID = %s'
        values = (uid,)
        exec_sql(query, values, commit=True)
        return jsonify({"status": "success", "message": "User deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/medication', methods=['PUT'])
@jwt_required()
def add_med():
    uid = get_jwt_identity()
    data = request.json

    try:
        query = 'INSERT INTO Medications(UserID, Name, Dosage, Frequency, TimesPerInterval, Modified'
        values = [uid, data['Name'], data['Dosage'], data['Frequency'], data['TimesPerInterval'], now_str()]
        if 'AdditionalInfo' in data:
            query += ', AdditionalInfo'
            values.append(data['AdditionalInfo'])
        query += ') VALUES (%s, %s, %s, %s, %s, %s'
        if 'AdditionalInfo' in data:
            query += ', %s'
        query += ')'
        id = exec_sql(query, tuple(values), commit=True, last_insert_id=True)
        return jsonify({"status": "success", "message": "Medication added successfully", "id": id}), 201
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/medication', methods=['POST'])
@jwt_required()
def update_med():
    uid = get_jwt_identity()
    print("uid",file=sys.stderr)
    data = request.json
    print("data",file=sys.stderr)
    try:
        query = 'UPDATE Medications SET '
        values = []

        for field in ['Name', 'Dosage', 'Frequency', 'TimesPerInterval', 'AdditionalInfo']:
            if field in data:
                query += field + ' = %s, '
                values.append(data[field])
        query += 'Modified = %s WHERE MedicationID = %s AND UserID = %s'
        values += [now_str(), data['MedicationID'], uid]
        exec_sql(query, tuple(values), commit=True)
        return jsonify({"status": "success", "message": "Medication data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/medication', methods=['DELETE'])
@jwt_required()
def delete_med():
    uid = get_jwt_identity()
    data = request.json
    try:
        exec_sql('DELETE FROM Medications WHERE MedicationID = %s AND UserID = %s', (data['MedicationID'], uid), commit=True)
        return jsonify({"status": "success", "message": "Reminder deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/medication', methods=['GET'])
@jwt_required()
def get_med():
    uid = get_jwt_identity()
    try:
        query = 'SELECT MedicationID, Name, Dosage, Frequency, TimesPerInterval, AdditionalInfo, Modified FROM Medications WHERE UserID = %s'
        return jsonify(exec_sql(query,(uid,)))
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/reminder', methods=['PUT'])
@jwt_required()
def add_reminder():
    uid = get_jwt_identity()
    data = request.json

    try:
        rows = exec_sql('SELECT MedicationID FROM Medications WHERE MedicationID = %s AND UserID = %s', (data['MedicationID'], uid))
        if len(rows) == 0:
            return jsonify({"status": "fail", "message": "Medication does not exist"}), 404
        query = 'INSERT INTO Reminders(UserID, MedicationID, Hour, Minute, Modified'
        values = [uid, data['MedicationID'], data['Hour'], data['Minute'], now_str()]
        if 'Day' in data:
            query += ', Day'
            values.append(data['Day'])
        query += ') VALUES (%s, %s, %s, %s, %s'
        if 'Day' in data:
            query += ', %s'
        query += ')'
        id = exec_sql(query, tuple(values), commit=True, last_insert_id=True)
        return jsonify({"status": "success", "message": "Reminder added successfully", "id": id}), 201
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/reminder', methods=['POST'])
@jwt_required()
def update_reminder():
    uid = get_jwt_identity()
    data = request.json
    try:
        query = 'UPDATE Reminders SET '
        values = []

        for field in ['Hour', 'Minute', 'Day']:
            if field in data:
                query += field + ' = %s, '
                values.append(data[field])
        query += 'Modified = %s WHERE ReminderID = %s AND UserID = %s'
        values += [now_str(), data['ReminderID'], uid]
        exec_sql(query, tuple(values), commit=True)
        return jsonify({"status": "success", "message": "Reminder data updated successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/reminder', methods=['DELETE'])
@jwt_required()
def delete_reminder():
    uid = get_jwt_identity()
    data = request.json
    try:
        exec_sql('DELETE FROM Reminders WHERE ReminderID = %s AND UserID = %s', (data['ReminderID'], uid), commit=True)
        return jsonify({"status": "success", "message": "Reminder deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/reminder', methods=['GET'])
@jwt_required()
def get_reminder():
    uid = get_jwt_identity()
    try:
        query = 'SELECT ReminderID, MedicationID, Hour, Minute, Day, Modified FROM Reminders WHERE UserID = %s'
        return jsonify(exec_sql(query,(uid,)))
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/log', methods=['PUT'])
@jwt_required()
def add_log():
    uid = get_jwt_identity()
    data = request.json

    try:
        query = 'INSERT INTO Logs(UserID, Name, Amount, Time) VALUES (%s, %s, %s, %s)'
        values = (uid, data['Name'], data['Amount'], data['Time'])
        id = exec_sql(query, tuple(values), commit=True, last_insert_id=True)
        return jsonify({"status": "success", "message": "Log added successfully", "id": id}), 201
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/log', methods=['DELETE'])
@jwt_required()
def delete_log():
    uid = get_jwt_identity()
    data = request.json
    try:
        exec_sql('DELETE FROM Logs WHERE LogID = %s AND UserID = %s', (data['LogID'], uid), commit=True)
        return jsonify({"status": "success", "message": "Log deleted successfully"}), 200
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/log', methods=['GET'])
@jwt_required()
def get_log():
    uid = get_jwt_identity()
    try:
        query = 'SELECT LogID, Name, Amount, Time FROM Logs WHERE UserID = %s'
        return jsonify(exec_sql(query,(uid,)))
    except mysql.connector.Error as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/clear')
def clear():
    exec_sql('DELETE FROM Users', commit=True)
    exec_sql('''
INSERT INTO Users(FirstName, LastName, Email, PasswordHash) VALUES (
    "Simon",
    "Barkehanai",
    "sbarkeha@ucsc.edu",
    X'a2c7ef5760b6d879bedf74dc40aadd7cd397e6d3975e17047df1a6b77164fcc1381fef28a69a0ea16a5fc64ca53a58acfc631e03b54c2676ac50ea577d8b10f3' -- pw='foobar', salt='salt'
);
''', commit=True)
    return "cleared\n"

    return jsonify(data)

# run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
