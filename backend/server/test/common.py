#!/usr/bin/env python

import requests
from uuid import uuid4

host = 'http://localhost:5000'

def request(method, path, token=None, **kwargs):
    def_kwargs = {
        'timeout': 1,
        'headers': {},
    }
    for k in def_kwargs:
        if k not in kwargs:
            kwargs[k] = def_kwargs[k]
    if token is not None:
        kwargs['headers']['Authorization'] = 'Bearer ' + token
        
    return requests.request(method, host + path, **kwargs)

# returns token
def login(username='sbarkeha@ucsc.edu', password='foobar'):
    r = request('POST', '/login', json={
        'username': username,
        'password': password,
    })
    r.raise_for_status()
    return r.json()['token']

def clear():
    request('GET', '/clear')

def add_med(t):
    id = str(uuid4())
    return (request('PUT', '/medication', token=t, json={
        'MedicationID': id,
        'Name': 'med1',
        'Dosage': 1,
        'Frequency': 'd',
        'TimesPerInterval': 1,
    }), id)

def add_rem(t, med_id):
    id = str(uuid4())
    return (request('PUT', '/reminder', token=t, json={
        'ReminderID': id,
        'MedicationID': med_id,
        'Hour': 15,
        'Minute': 0,
        'Day': 'Su',
        'Modified': '2024-06-07 2:33:43',
    }), id)
