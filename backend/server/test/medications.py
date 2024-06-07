#!/usr/bin/env python

import unittest
import common
from requests import HTTPError
from uuid import uuid4

class TestMedications(unittest.TestCase):
    def test_add(self):
        common.clear()
        t = common.login()
        (r, _) = common.add_med(t)
        self.assertEqual(r.status_code, 201)
        r = common.request('GET', '/medication', token=t)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
        data = r.json()[0]
        self.assertEqual(data['Dosage'], 1)
        self.assertEqual(data['Frequency'], 'd')
        self.assertIsInstance(data['MedicationID'], str)
        self.assertIsInstance(data['Modified'], str)
        self.assertEqual(data['Name'], 'med1')
        self.assertEqual(data['Dosage'], 1)
        self.assertEqual(data['TimesPerInterval'], 1)

    def test_bad_add(self):
        common.clear()
        t = common.login()
        r = common.request('PUT', '/medication', token=t, json={
            'MedicationID': str(uuid4()),
        })
        self.assertEqual(r.status_code, 500)

    def test_update(self):
        common.clear()
        t = common.login()
        (_, id) = common.add_med(t)
        r = common.request('POST', '/medication', token=t, json={
            'MedicationID': id,
            'Dosage': 2
        })
        self.assertEqual(r.status_code, 200)
        r = common.request('GET', '/medication', token=t)
        self.assertEqual(r.json()[0]['Dosage'], 2)

    def test_delete(self):
        common.clear()
        t = common.login()
        (_, id) = common.add_med(t)
        r = common.request('GET', '/medication', token=t)
        self.assertEqual(len(r.json()), 1)
        r = common.request('DELETE', '/medication', token=t, json={
            'MedicationID': id
        })
        self.assertEqual(r.status_code, 200)
        r = common.request('GET', '/medication', token=t)
        self.assertEqual(len(r.json()), 0)
