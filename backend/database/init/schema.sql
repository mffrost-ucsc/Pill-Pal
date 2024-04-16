-- Database Schema Should Go Here
-- Code below right now is just for a test, it can be deleted/altered as needed

CREATE DATABASE test;
USE test;

CREATE TABLE test_data (
	title VARCHAR(20)
);

-- test data
INSERT INTO test_data (title) VALUES ('Testing...');

INSERT INTO test_data (title) VALUES ('Hello');

INSERT INTO test_data (title) VALUES ('World!');
