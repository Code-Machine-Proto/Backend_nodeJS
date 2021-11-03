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
import Course from "../../models/Course";
import { ICourse } from "../../models/Course";
import { uuid } from 'uuidv4';
import Problem from '../../models/Problem';
import Profile, { IProfile } from "../../models/Profile";
import Processor from "../../models/Processor";
import { IProcessor } from "../../models/Processor";

const router: Router = Router();


// @route   POST api/processor/create
// @desc    Create a new course
// @access  Public
router.post(
  "/create",
  [
    check("name", "Please include a name").exists(),
    check("type", "Please include a type").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { name, problems, type }: IProcessor = req.body;
    try {

      const newProcessor = await Processor.create({ type, name, problems });
      await Problem.updateMany({ '_id': newProcessor.problems }, { $push: { processors: newProcessor._id } });
      res.json({ hasErrors: false });
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
    }
  }
);

// @route   POST api/processor/assign
// @desc    Create a new processor
// @access  Public
router.post(
  "/assign",
  [
    check("courses", "Please include a list of courses").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const { courses }: IUser = req.body;

    const user: IUser = await User.findOne({ _id: req.body.userId });

    if (!user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: "User not registered",
          },
        ],
      });
    }

    try {
      user.courses.push(courses);
      await user.save()

    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
    }
  }
);

export default router;
