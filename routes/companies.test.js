process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const ExpressError = require("../expressError");
const db = require("../db")
// let popsicle = {name:"popsicle", price:2.50};

// let testCompany;
// beforeEach(async function() {
//     const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ("fb", "facebook", "social media company") RETURNING code, name, description`)
//     testCompany = result.rows[0]
// })


afterAll(async function() {
    await db.end()
})

describe("GET /companies", () => {
    test("GET all companies in database", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body.companies.length).toEqual(2);
    })
})

describe("GET /companies/:id", () => {
    test("GET info about Apple", async () => {
        const res = await request(app).get('/companies/apple');
        expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toEqual("apple");
        expect(res.body.company.name).toEqual("Apple Computer");
        expect(res.body.company.description).toEqual("Maker of OSX.");
    })
    test("GET info about IBM", async () => {
        const res = await request(app).get('/companies/ibm');
        expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toEqual("ibm");
        expect(res.body.company.name).toEqual("IBM");
        expect(res.body.company.description).toEqual("Big blue.");
    })
})

describe("POST /companies", () => {
    test("POST a new company into the company table", async () => {
        const res = await request(app).post('/companies').send({name:"Facebook", description: "A social medial company"});
        expect(res.statusCode).toBe(201);
        expect(res.body.company.code).toEqual("facebook");
        expect(res.body.company.name).toEqual("Facebook");
        expect(res.body.company.description).toEqual("A social medial company");
        const deletingFb = await request(app).delete('/companies/facebook');

    })
})

describe("PUT /companies/:id", () => {
    test("PUT info about a single company", async () => {
        const res = await request(app).put('/companies/apple').send({code: "appl", name: "Apple", description: "Computer Maker"});
        expect(res.statusCode).toBe(200);
        expect(res.body.company.code).toEqual("appl");
        expect(res.body.company.name).toEqual("Apple");
        expect(res.body.company.description).toEqual("Computer Maker");
        const resettingApple = await request(app).put('/companies/appl').send({code: "apple", name: "Apple Computer", description: "Maker of OSX."});

    })
})

describe("DELETE /companies/:id", () => {
    test("DELETE a single company from the database", async () => {
        const res = await request(app).delete('/companies/ibm');
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ status: 'deleted' });
        const resettingIbm = await request(app).post('/companies').send({name: "IBM", description: "Big blue."});
    })
})

