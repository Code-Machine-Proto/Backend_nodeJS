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
import auth from "../../middleware/auth";
import Answer from "../../models/Answer";
import { IAnswer } from "../../models/Answer";

const router: Router = Router();

// @route   POST api/compile
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/", auth,
  [
    check("problemId", "Please include the problem Id").exists(),
    check("program", "Please include the answer content").exists(),
    check("processorId", "Please include the processor Id").exists(),
  ],
  async (req: Request, res: Response) => {
    console.log('🚀 ~ req', req);
    console.log('🚀 ~ req', req);
    console.log('🚀 ~ req', req);
    try {

      const user: IUser = await User.findOne({ _id: req.userId });

      if (!user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "User not registered",
            },
          ],
        });
      }

      //add the new answer
      if (req.body.problemId) {
        console.log("yeah", req.body.compiledResult)
        const oldAnswer: IAnswer = await Answer.findOne({ user: req.userId, problem: req.body.problemId, content: req.body.program })
        if (!oldAnswer) {
          const answer: IAnswer = await Answer.create({ user: req.userId, problem: req.body.problemId, content: req.body.program, compiledResult: req.body.compiledResult })
          user.answers.push(answer)
          user.save()
        }
      }


      res.json({ hasError: false })
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
