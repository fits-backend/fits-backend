import express from "express";
const router = express.Router();
import { apiController } from "../controllers";
import AwsEmailService from "../services/AwsEmailService";

//Welcom api
router.get("/", apiController.api);
// router.get("/email", apiController.email);
router.get("/api", apiController.api);

export default router;
