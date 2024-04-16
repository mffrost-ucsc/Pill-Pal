# Reference: https://www.linkedin.com/pulse/building-flask-application-mysql-database-using-docker-agarwal/

FROM python:3.9

EXPOSE 5000

WORKDIR /app

COPY requirements.txt /app

RUN pip install -r requirements.txt

COPY app.py /app

CMD python app.py
