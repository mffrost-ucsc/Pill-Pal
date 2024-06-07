#!/usr/bin/env python

import unittest
import common
from requests import HTTPError

class TestAccounts(unittest.TestCase):
    def test_login(self):
        common.clear()
        t = common.login()
        self.assertRegex(t, '^[\\w-]+(?:\\.[\\w-]+){2}$')

    def test_badpw(self):
        common.clear()
        with self.assertRaises(HTTPError):
            common.login(password='badpw')


    def test_create(self):
        common.clear()
        r = common.request('PUT', '/user', json={
            'FirstName': 'Simon2',
            'LastName': 'Barkehanai',
            'Email': 'sbarkeha2@ucsc.edu',
            'Password': 'password',
        })
        self.assertEqual(r.status_code, 201)

    def test_update(self):
        common.clear()
        t = common.login()
        r = common.request('POST', '/user', token=t, json={'FirstName': 'Simon2'})
        self.assertEqual(r.status_code, 200)
        r = common.request('GET', '/name', token=t)
        self.assertEqual(r.text, 'Simon2 Barkehanai')

    def test_delete(self):
        common.clear()
        t = common.login()
        r = common.request('DELETE', '/user', token=t)
        self.assertEqual(r.status_code, 200)
        with self.assertRaises(HTTPError):
            common.login()
