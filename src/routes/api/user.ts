import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import config from "config";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/",
  [
    check("username", "Please include a valid username").isLength({min: 3}),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 3 })
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    console.log('🚀 ~ req.body', req.body);
    try {
      let user: IUser = await User.findOne({ username });

      if (user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          errors: [
            {
              msg: "User already exists"
            }
          ]
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // Build user object based on IUser
      const userFields = {
        username,
        password: hashed,
      };

      user = new User(userFields);

      await user.save();

      const payload: Payload = {
        userId: user.id
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiration") },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
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
