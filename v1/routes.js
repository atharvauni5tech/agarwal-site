var express = require('express')
var router = express.Router()

var authentication = require("./authentication/routes");
var blogs = require("./blogs/routes");
var leads = require("./leads/routes");
var hr = require("./hr/routes");

router.use("/auth", authentication);
router.use("/blogs", blogs);
router.use("/leads", leads);
router.use("/hr", hr);

router.get("/test", (req, res) => {
  res.json({ success: true, message: "V1 API is working!" });
});

module.exports = router