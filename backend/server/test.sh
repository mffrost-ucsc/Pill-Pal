#!/bin/bash

host=localhost:5000

curl $host/clear

token="$(curl $host/login -X POST --data '{"username":"sbarkeha@ucsc.edu","password":"foobar"}' -H 'Content-Type: application/json' 2>/dev/null | jq '.token' | sed -E 's/^"(.*)"$/\1/')"

echo Adding a medication
MedicationID=$(curl $host/medication -X PUT --data '{"Name":"med1","Dosage":1,"Frequency":"w","TimesPerInterval":1}' -H 'Content-Type: application/json' -H "Authorization: Bearer $token" 2>/dev/null | jq '.id')
curl $host/medication -X GET -H "Authorization: Bearer $token"
echo Modifying a medication
curl $host/medication -X POST --data '{"MedicationID":'$MedicationID',"Dosage":2}' -H 'Content-Type: application/json' -H "Authorization: Bearer $token"
curl $host/medication -X GET -H "Authorization: Bearer $token"
echo

echo Adding a reminder
ReminderID=$(curl $host/reminder -X PUT --data '{"MedicationID":'$MedicationID',"Hour":8,"Minute":30}' -H 'Content-Type: application/json' -H "Authorization: Bearer $token" 2>/dev/null | jq '.id')
curl $host/reminder -X GET -H "Authorization: Bearer $token"
echo Modifying a reminder
curl $host/reminder -X POST --data '{"ReminderID":'$ReminderID',"Hour":20}' -H 'Content-Type: application/json' -H "Authorization: Bearer $token"
curl $host/reminder -X GET -H "Authorization: Bearer $token"
echo

echo Adding a log
LogID=$(curl $host/log -X PUT --data '{"Name":"med1","Amount":2,"Time":"2024-05-20 20:30"}' -H "Content-Type: application/json" -H "Authorization: Bearer $token" 2>/dev/null | jq '.id')
curl $host/log -X GET -H "Authorization: Bearer $token"
echo Deleting a log
curl $host/log -X DELETE --data '{"LogID":'$LogID'}' -H "Content-Type: application/json" -H "Authorization: Bearer $token"
curl $host/log -X GET -H "Authorization: Bearer $token"
echo

echo Deleting a medication
curl $host/medication -X DELETE --data '{"MedicationID":'$MedicationID'}' -H "Content-Type: application/json" -H "Authorization: Bearer $token"
echo Medications:
curl $host/medication -X GET -H "Authorization: Bearer $token"
echo Reminders:
curl $host/reminder -X GET -H "Authorization: Bearer $token"
