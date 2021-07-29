import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import config from "config";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import fetch from "node-fetch"

const router: Router = Router();

// @route   POST api/compile
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/",
  async (req: Request, res: Response) => {

    try {
      const response = await fetch("http://localhost:8080/compileAndRun",
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(req.body)
        });
      
        const content = await response.json()
        res.json(content)
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
    }
  }
);

// // @route   GET api/user
// // @desc    Get all users
// // @access  Public
// router.get("/", async (_req: Request, res: Response) => {
//   try {
//     const profiles = await Profile.find().populate("user", ["avatar", "username"]);
//     res.json(profiles);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });

export default router;
