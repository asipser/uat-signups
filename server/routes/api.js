/* 
   Defines all routes under /api
   Sets up all other modules in this directory
*/

const express = require("express");
const router = express.Router();

router.get("/whoami", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(req.user);
  }

  res.send({});
});

router.post("/signup", async (req, res) => {});

router.put("/signup", async (req, res) => {});

router.delete("/signup", async (req, res) => {});

router.post("/event", async (req, res) => {});

router.put("/event", async (req, res) => {});

router.delete("/event", async (req, res) => {});

module.exports = router;
