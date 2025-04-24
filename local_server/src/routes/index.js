const express = require("express");
const paymentRoutes = require("./payment_route");

const router = express.router();

router.get("/", (req, res) => {
  res.send("Hello");
  console.log("환영합니다!");
});

router.use("/payment", paymentRoutes);

module.exports = routes;
