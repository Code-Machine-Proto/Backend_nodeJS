import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";
import Profile, { IProfile } from "../../models/Profile";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import Answer, { IAnswer } from './../../models/Answer';

const router: Router = Router();

// @route   DELETE api/answer/<problemId>
// @desc    Get all answers from one problem
// @access  Private
router.delete("/all", async (req: Request, res: Response) => {
  try {
    await Answer.deleteMany({ "user.role": { $nin: ["TEACHER", "ADMIN"] } })
    res.json({ "response": "ok" })
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});



// @route   GET api/answer/<problemId>
// @desc    Get all answers from one problem
// @access  Private
router.get("/:problemId", auth, async (req: Request, res: Response) => {
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

    const answers: IAnswer[] = await Answer.find({ user: req.userId, problem: req.params.problemId }).sort('-published')
    console.log('🚀 ~ router.get ~ answers', answers);

    res.json(answers);
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

// @route   GET api/answer/<answerId>
// @desc    Get one answer
// @access  Private
// router.get("/", auth, async (req: Request, res: Response) => {
//   try {
//     const profile: IProfile = await Profile.findOne({
//       user: req.userId,
//     });

//     if (!profile) {
//       return res.status(HttpStatusCodes.BAD_REQUEST).json({
//         errors: [
//           {
//             msg: "There is no profile for this user",
//           },
//         ],
//       });
//     }

//     const answers: IAnswer[] = await Answer.find({user: req.userId, problem: req.params.problemId })

//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });


export default router;
