# References:
#   - https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/

from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

# configure MySQL database
config = {
        'user': 'root',
        'password': 'pwd',
        'host': 'host.docker.internal',
        'port': '3906',
        'database': 'test'
    }

# test route
@app.route('/test', methods=['GET'])
def testing():
    connection = mysql.connector.connect(**config)
    cursor = connection.cursor(dictionary=True)
    cursor.execute('''SELECT * FROM test_data''')
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
