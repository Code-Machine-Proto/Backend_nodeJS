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
import Processor from "../../models/Processor";

const router: Router = Router();


// @route   POST api/problem/create
// @desc    Create a new problem
// @access  Public
router.post(
  "/create",
  [
    check("title", "Title is required").exists(),
    check("type", "Type is required").exists(),
    check("question", "Question is required").exists(),
    check("processors", "Processor is required").exists(),
    check("answers", "Answers is required").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { title, type, question, processors, answers, isAdmin }: IProblem = req.body;

    const ProblemData = {
      title, type, question, processors, answers, isAdmin
    }

    try {
      const newProblem = await Problem.create(ProblemData);
      await Processor.updateMany({ '_id': newProblem.processors }, { $push: { problems: newProblem._id } });
      res.json({ hasErrors: false });

    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
    }
  }
);

export default router;
