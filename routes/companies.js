const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows})
    } catch(e) {
        return next(e);
    }
})

router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if(result.rows.length === 0) {
            throw new ExpressError(`Company not found with the code: ${code}`, 404)
        }
        return res.json({company: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        return res.status(201).json({company: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        if(!req.body) {
            throw new ExpressError(`Need a 'code', 'name', and 'description' value.`, 404)
        }
        const id = req.params.id
        const {code, name, description} = req.body;
        const result = await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code = $4 RETURNING *`, [code, name, description, id]);
        if(result.rows.length === 0) {
            throw new ExpressError(`Company not found with the code: ${id}`, 404)
        }
        return res.json({company: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code]);
        if(result.rows.length === 0) {
            throw new ExpressError(`Company not found with the code: ${req.params.code}`, 404)
        }
        const deleted = await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code]);
        return res.json({status: "deleted"})
    } catch(e) {
        return next(e);
    }
})

module.exports = router;