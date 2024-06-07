#!/usr/bin/env python

import unittest
import common
from requests import HTTPError
from uuid import uuid4

class TestReminders(unittest.TestCase):
    def test_add(self):
        common.clear()
        t = common.login()
        (_, med_id) = common.add_med(t)
        (r, rem_id) = common.add_rem(t, med_id)
        self.assertEqual(r.status_code, 201)
        r = common.request('GET', '/reminder', token=t)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
        data = r.json()[0]
        self.assertEqual(data['ReminderID'], rem_id)
        self.assertEqual(data['MedicationID'], med_id)
        self.assertEqual(data['Hour'], 15)
        self.assertEqual(data['Minute'], 0)
        self.assertEqual(data['Day'], 'Su')
        self.assertIsInstance(data['Modified'], str)

    def test_bad_add(self):
        common.clear()
        t = common.login()
        r = common.request('PUT', '/reminder', token=t, json={
            'MedicationID': str(uuid4()),
        })
        self.assertEqual(r.status_code, 404)

    def test_update(self):
        common.clear()
        t = common.login()
        (_, med_id) = common.add_med(t)
        (r, rem_id) = common.add_rem(t, med_id)
        r = common.request('POST', '/reminder', token=t, json={
            'ReminderID': rem_id,
            'Hour': 3
        })
        self.assertEqual(r.status_code, 200)
        r = common.request('GET', '/reminder', token=t)
        self.assertEqual(r.json()[0]['Hour'], 3)

    def test_delete(self):
        common.clear()
        t = common.login()
        (_, med_id) = common.add_med(t)
        (r, rem_id) = common.add_rem(t, med_id)
        r = common.request('GET', '/reminder', token=t)
        self.assertEqual(len(r.json()), 1)
        r = common.request('DELETE', '/reminder', token=t, json={
            'ReminderID': rem_id
        })
        self.assertEqual(r.status_code, 200)
        r = common.request('GET', '/reminder', token=t)
        self.assertEqual(len(r.json()), 0)
