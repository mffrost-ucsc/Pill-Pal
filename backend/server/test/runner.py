#!/usr/bin/env python
import unittest
import accounts, reminders, medications

if __name__ == '__main__':
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromNames(['accounts','medications','reminders'])
    unittest.TextTestRunner().run(suite)
