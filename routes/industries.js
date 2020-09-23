const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
var slugify = require('slugify')

// Add routes for:

//     adding an industry
//     associating an industry to a company

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

module.exports = router;