\c biztime_test

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON UPDATE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    ind_code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE company_industry (
    id serial PRIMARY KEY,
    c_code text NOT NULL REFERENCES companies ON UPDATE CASCADE,
    i_code text NOT NULL REFERENCES industries ON UPDATE CASCADE
);


INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES ('sas', 'Software As Service'),
          ('tech', 'Tech Company'),
         ('fintech', 'Financial Tech');

INSERT INTO company_industry (c_code, i_code)
  VALUES ('apple', 'tech'),
         ('ibm', 'tech');

