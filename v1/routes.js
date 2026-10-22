var express = require('express')
var router = express.Router()

var authentication = require("./authentication/routes");

router.use("/auth", authentication);

router.get("/test", (req, res) => {
  res.json({ success: true, message: "V1 API is working!" });
});

module.exports = router