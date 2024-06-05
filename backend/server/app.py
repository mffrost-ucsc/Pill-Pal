# References:
#   - https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask import Flask, jsonify, request
from datetime import datetime, timedelta
import mysql.connector
import bcrypt
import sys
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = '\xb0\x19\xa3\xa0\x59\x9c\x02\xdf\x77\x6d\xeb\x7e\x0f\x25\x45\x36\x72\x82\x16\x70\x2f\x36\xea\x63\x94\x8f\xda\x0b\x4d\xee\xc4\x38\xa6\xb0\xf8\xd3\xf9\x10\x79\xa8\x8b\xe7\xf2\x10\x6f\x73\x84\x32\x6a\x63\xf7\x06\xe0\x94\x08\xba\x26\xea\x1a\xde\x12\xe5\x1d\x7f'
app.config["JWT_SECRET_KEY"] = '\x26\xc8\xf4\xe1\x55\xf4\xea\xad\xc7\x06\xa2\x9f\x29\xfb\xa9\x8d\x1a\x5a\xff\xce\x57\x14\x31\x80\x0b\x31\xd7\x7f\x51\x4c\xf5\x7f\x81\x60\x86\xab\x03\xbd\xc8\xab\x8e\x66\x07\x22\xeb\x72\x8d\xab\xdf\xf1\x0f\xfa\xc6\xe3\x0b\x44\x9e\x8f\xd0\x55\x21\x38\x12\x8e'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=90)
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

def hashpw(pword, salt):
    if isinstance(pword, str):
        pword = pword.encode('utf-8')
    return bcrypt.kdf(password=pword,
                      salt=salt,
                      desired_key_bytes=64,
                      rounds=100)

def checkpw(db_pword, pword, salt):
    return db_pword == hashpw(pword, salt)

def new_salt():
    return secrets.token_bytes(32)


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
    query = '''SELECT UserID,PasswordHash,PasswordSalt FROM Users WHERE Email = %s'''
    values = (uname,)
    row = exec_sql(query, values)

    if row and checkpw(row[0]['PasswordHash'], pword.encode(), row[0]['PasswordSalt']):
        token = create_access_token(identity=row[0]['UserID'])
        return jsonify({'message': 'Login Success', 'token': token, 'userId': row[0]['UserID']})
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
    return do_add_user(data['FirstName'], data['LastName'], data['Email'], data['Password'])

def do_add_user(first_name, last_name, email, password):
    rows = exec_sql('SELECT UserID FROM Users WHERE Email = %s', (email,))
    if len(rows) != 0:
        return jsonify({"status": "fail", "message": "Error: user already exists"}), 403
    try:
        query = '''INSERT INTO Users(FirstName, LastName, Email, PasswordHash, PasswordSalt) VALUES (%s, %s, %s, %s, %s)'''
        salt = new_salt()
        values = (first_name, last_name, email, hashpw(password, salt), salt)
        userId = exec_sql(query, values, commit=True, last_insert_id=True)
        return jsonify({"status": "success", "message": "User added successfully", 'userId': userId}), 201
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
            query += 'PasswordHash = %s, PasswordSalt = %s, '
            salt = new_salt()
            values += [hashpw(data['Password'], new_salt), new_salt]
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
        query = 'INSERT INTO Medications(MedicationID, UserID, Name, Dosage, Frequency, TimesPerInterval, Modified'
        values = [data['MedicationID'], uid, data['Name'], data['Dosage'], data['Frequency'], data['TimesPerInterval'], now_str()]
        if 'AdditionalInfo' in data:
            query += ', AdditionalInfo'
            values.append(data['AdditionalInfo'])
        if 'TimeBetweenDose' in data:
            query += ', TimeBetweenDose'
            values.append(data['TimeBetweenDose'])
        query += ') VALUES (%s, %s, %s, %s, %s, %s, %s'
        if 'AdditionalInfo' in data:
            query += ', %s'
        if 'TimeBetweenDose' in data:
            query += ', %s'
        query += ')'
        exec_sql(query, tuple(values), commit=True)
        return jsonify({"status": "success", "message": "Medication added successfully"}), 201
    except mysql.connector.Error as e:
        print(str(e), file=sys.stderr)
        return jsonify({"status": "fail", "message": str(e)}), 500

@app.route('/medication', methods=['POST'])
@jwt_required()
def update_med():
    uid = get_jwt_identity()
    data = request.json
    try:
        query = 'UPDATE Medications SET '
        values = []

        for field in ['Name', 'Dosage', 'Frequency', 'TimesPerInterval', 'TimeBetweenDose', 'AdditionalInfo']:
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
        query = 'SELECT MedicationID, Name, Dosage, Frequency, TimesPerInterval, TimeBetweenDose, AdditionalInfo, Modified FROM Medications WHERE UserID = %s'
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
        query = 'INSERT INTO Reminders(ReminderID, UserID, MedicationID, Hour, Minute, Modified'
        values = [data['ReminderID'], uid, data['MedicationID'], data['Hour'], data['Minute'], data['Modified']]
        if 'Day' in data:
            query += ', Day'
            values.append(data['Day'])
        query += ') VALUES (%s, %s, %s, %s, %s, %s'
        if 'Day' in data:
            query += ', %s'
        query += ')'
        id = exec_sql(query, tuple(values), commit=True)
        return jsonify({"status": "success", "message": "Reminder added successfully"}), 201
    except mysql.connector.Error as e:
        print(str(e), file=sys.stderr)
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
        print(str(e), file=sys.stderr)
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
        print(str(e), file=sys.stderr)
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
    do_add_user('Simon', 'Barkehanai', 'sbarkeha@ucsc.edu', b'foobar')
    return "cleared\n"

    return jsonify(data)

# run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
