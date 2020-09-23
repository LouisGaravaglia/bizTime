const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
var slugify = require('slugify')

router.get("/", async (req, res, next) => {
    try {
         const industryResults = await db.query(`
        SELECT i.ind_code, i.name, ARRAY_AGG(c_i.c_code) AS comp_codes
        FROM industries AS i 
        LEFT JOIN company_industry AS c_i
        ON i.ind_code = c_i.i_code
        GROUP BY i.ind_code
        `)
        return res.json({compResults: industryResults.rows})
    } catch(e) {
        return next(e);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {name} = req.body;
        const code = slugify(name, {replacement: '_', remove: /[*+~.()'"!:@]/g, lower: true, strict: true})
        const result = await db.query(`INSERT INTO industries (ind_code, name) VALUES ($1, $2) RETURNING *`, [code, name]);
        return res.status(201).json({company: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.post("/:comp_code", async (req, res, next) => {
    try {
        const {ind_code} = req.body;
        const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.comp_code]);
        if(company.rows.length === 0) {
            throw new ExpressError(`Company not found with the code: ${req.params.comp_code}`, 404)
        }
        const result = await db.query(`INSERT INTO company_industry (c_code, i_code) VALUES ($1, $2) RETURNING *`, [req.params.comp_code, ind_code]);
        return res.status(201).json({company: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

module.exports = router;