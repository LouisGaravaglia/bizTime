const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows})
    } catch(e) {
        return next(e);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await db.query(`SELECT i.id, 
                  i.comp_code, 
                  i.amt, 
                  i.paid, 
                  i.add_date, 
                  i.paid_date, 
                  c.name, 
                  c.description 
           FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)  
           WHERE id = $1`, [id]);
        if(result.rows.length === 0) {
            throw new ExpressError(`Company not found with the code: ${id}`, 404)
        }
        const data = result.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({"invoice": invoice});
    } catch(e) {
        return next(e);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.json({"invoice": results.rows[0]})
    } catch(e) {
        return next(e);
    }
})

    // Updates an invoice.

    // If invoice cannot be found, returns a 404.

    // Needs to be passed in a JSON body of {amt, paid}

    //     If paying unpaid invoice: sets paid_date to today
    //     If un-paying: sets paid_date to null
    //     Else: keep current paid_date

    // Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put("/:id", async (req, res, next) => {
    try {
        let amt;
        let paid;
        let paidDate = new Date();
        let result;
        let nullDate = null;
        if(req.body.amt){
            amt = req.body.amt;
        }
        if(req.body.paid){
            paid = req.body.paid;
        }
        const id = req.params.id;
        const invoice = await db.query(`SELECT paid, paid_date FROM invoices WHERE id = $1`, [id]);
        if(paid === true) {
            result = await db.query(`UPDATE invoices SET amt=$1, paid=$3, paid_date=$4 WHERE id = $2 RETURNING *`, [amt, id, paid, paidDate]);
        } else {
            if(invoice.rows[0].paid === true) {
                result = await db.query(`UPDATE invoices SET amt=$1, paid=$3, paid_date=$4 WHERE id = $2 RETURNING *`, [amt, id, paid, nullDate]);
            } else {
                result = await db.query(`UPDATE invoices SET amt=$1, paid=$3 WHERE id = $2 RETURNING *`, [amt, id, paid]);
            }
        }
        if (result.rows.length === 0) {
            throw new ExpressError(`No such invoice with the id of: ${id}`, 404);
        }
        return res.json({invoice: result.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        let id = req.params.id;
        const invoice = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (invoice.rows.length === 0) {
            throw new ExpressError(`No such invoice with the id of: ${id}`, 404);
        }
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        return res.json({status: "deleted"})
    } catch(e) {
        return next(e);
    }
})

module.exports = router;