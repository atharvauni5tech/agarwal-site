var express = require('express')
var router = express.Router()

var authentication = require("./authentication/routes");
var brokers = require("./brokers/routes");
var customers = require("./customers/routes");
var dashboard = require("./dashboard/routes");
var projects = require("./projects/routes");
var users = require("./users/routes");
var leads = require("./leads/routes");
var masters = require("./masters/routes");
var visits = require("./visits/routes");
var sales = require("./sales/routes");
var bookings = require("./bookings/routes");
var commissions = require("./commissions/routes");
var templates = require("./templates/templatesRoutes");
var notifications = require("./notifications/routes");

router.use("/auth", authentication);
router.use("/brokers", brokers);
router.use("/customers", customers);
router.use("/dashboard", dashboard);
router.use("/projects", projects);
router.use("/users", users);
router.use("/leads", leads);
router.use("/masters", masters);
router.use("/visits", visits);
router.use("/sales", sales);
router.use("/bookings", bookings);
router.use("/commissions", commissions);
router.use("/templates", templates);
router.use("/notifications", notifications);


router.get("/test", (req, res) => {
  res.json({ success: true, message: "V1 API is working!" });
});

module.exports = router