import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";

import auth from "../../middleware/auth";
import Profile, { IProfile } from "../../models/Profile";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import Answer, { IAnswer } from '../../models/Answer';
// import Setting from "src/models/Settings";
// import { ISetting } from "src/models/Settings";

const router: Router = Router();

// @route   DELETE api/answer/<problemId>
// @desc    Get all answers from one problem
// @access  Private
router.delete("/all", async (req: Request, res: Response) => {
  try {
    await Answer.deleteMany({ "user.role": { $nin: ["TEACHER", "ADMIN"] } })
    console.log("deleted")
    res.json({ "response": "ok" })
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});



// @route   GET api/setting/
// @desc    Get all setting
// @access  Private
// router.get("/", auth, async (req: Request, res: Response) => {
//   try {
//     const user: IUser = await User.findOne({ _id: req.userId });

//     if (!user) {
//       return res.status(HttpStatusCodes.BAD_REQUEST).json({
//         errors: [
//           {
//             msg: "User not registered",
//           },
//         ],
//       });
//     }

//     const settings: ISetting[] = await Setting.find()
//     console.log('🚀 ~ router.get ~ Setting', settings);

//     res.json(settings);
//   } catch (err) {
//     console.error(err.message);
//     res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// });

// @route   POST api/setting/
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
// router.post(
//   "/updateKeywords",
//   [
//     check("keywords", "Please include a valid list").isArray({ min: 1 }),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(HttpStatusCodes.BAD_REQUEST)
//         .json({ errors: errors.array() });
//     }
//     const { keywords } = req.body;

//     // let user: IUser = await User.findOne({ email, role, matricule });
//     console.log('🚀 ~ user', user);

//     try {
//       res.json({ hasErrors: false })
//     } catch (err) {
//       console.error(err.message);
//       res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error: " + err.message);
//     }
//   }
// );

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
