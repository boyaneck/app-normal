import express from "express";
import paymentRoutes from "../payment/payment_route";
const router = express.router();

router.get("/", (req, res) => {
  res.send("Hello");
  console.log("환영합니다!");
});

router.use("/payment", paymentRoutes);

export default router;
