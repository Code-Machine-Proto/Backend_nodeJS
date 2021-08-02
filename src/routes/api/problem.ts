import bcrypt from "bcryptjs";
import config from "config";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import auth from "../../middleware/auth";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import Problem from "../../models/Problem";
import { uuid } from "uuidv4";
import { IProblem } from './../../models/Problem';
import Course from "../../models/Course";

const router: Router = Router();

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const user: IUser = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});


// @route   POST api/problem/create
// @desc    Create a new problem
// @access  Public
router.post(
  "/create",
  [
    check("title", "Title is required").exists(),
    check("type", "Type is required").exists(),
    check("question", "Question is required").exists(),
    check("courses", "Courses is required").exists(),
    check("answers", "Answers is required").exists(),
    check("processor", "Processor is required").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { title, type, question, processor, courses, answers }:IProblem = req.body;

    const ProblemData = {
      title, type, question, processor, courses, answers
    }
    try {
      const newProblem = await Problem.create(ProblemData);
      await Course.updateMany({ '_id': newProblem.courses }, { $push: { problems: newProblem._id } });

    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
);

export default router;
