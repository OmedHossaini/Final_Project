const express = require('express');
const router = express.Router();

router.get("/test", (req, res) => {
    res.status(200).json({ status: 200, message: "Good job!" });
});

module.exports = router;
