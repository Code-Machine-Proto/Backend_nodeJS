import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import config from "config";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";
import auth from "../../middleware/auth";
import Course from "../../models/Course";

const router: Router = Router();

// @route   POST api/user/add
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/add",
  [
    check("firstname", "Please include a valid firstname").isLength({ min: 3 }),
    check("lastname", "Please include a valid lastname").isLength({ min: 3 }),
    check("role", "Please include a valid role").isLength({ min: 3 }),
    check("email", "Please include a valid email").normalizeEmail().isEmail(),
    check(
      "matricule",
      "Please include a valid matricule"
    ).isLength({ min: 3, max: 10 })
  ],
  async (req: Request, res: Response) => {

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      console.log("🚀 ~ file: user.ts:37 ~ errors:", errors)
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ errors: errors.array() });
    }

    const { lastname, email, matricule, firstname, role } = req.body;

    let user: IUser = await User.findOne({ email, role, matricule });
    console.log('🚀 ~ user', user);

    if (user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        hasErrors: true,
        type: 'user_already_exists',
        errors: [
          {
            msg: "Username Already Taken"
          }
        ]
      });
    }

    const salt = await bcrypt.genSalt(config.get("salt_round"));
    const hashed = await bcrypt.hash("password", salt);

    try {
      const course = await Course.findOne({ name: "INF1600" });
      console.log('🚀 ~ course', course);
      await User.create({ lastname, email, matricule, role, firstname, password: hashed, courses: [course.id] })
      res.json({ hasErrors: false })
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error: " + err.message);
    }
  }
);


// @route   POST api/user/completeUserInfo
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/completeUserInfo",
  [
    check("username", "Please include a valid username").isLength({ min: 3 }),
    check("email", "Please include a valid email").normalizeEmail().isEmail(),
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
    const { username, email, password } = req.body;

    let user: IUser = await User.findOne({ username });

    if (user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: "Username Already Taken"
          }
        ]
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    try {
      await User.updateOne({ email }, { $set: { password: hashed, username } })
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error: " + err.message);
    }
  }
);

// @route   POST api/user
// @desc    Register user given their username and password, returns the token upon successful registration
// @access  Public
router.post(
  "/",
  [
    check("username", "Please include a valid username").isLength({ min: 3 }),
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
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error: " + err.message);
    }
  }
);

// @route   POST api/user/bulkSignup
// @desc    register multiple users
// @access  Public
router.post(
  "/bulkSignup", auth,
  async (req: Request, res: Response) => {

    const users = req.body;
    console.log("🚀 ~ file: user.ts:194 ~ users:", users)
    try {
      const bulk = User.collection.initializeUnorderedBulkOp();

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash("password", salt);

      for (const user of users) {

        // Build user object based on IUser
        const userFields = {
          firstname: user.firstname,
          lastname: user.lastname,
          matricule: user.matricule,
          email: user.email,
          password: hashed,
          role: "STUDENT",
          courses: ["61822f5adb3db400572083a3"]
        };
        bulk.insert(userFields);
      }


      bulk.execute(function (err, result) {
        if (err) {
          console.log('🚀 ~ err', "something went wrong");
          // throw err
          res.json({ hasErrors: true, errors: err.message });;

        } else {
          res.json({ hasErrors: false, payload: "success" })
        }
      });

    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ hasErrors: true, errors: err.message });;
    }
  }
);

// @route   POST api/user/bulkAddCourse
// @desc    Create a new course to all users
// @access  Public
router.post(
  "/bulkAddCourse",
  [
    check("courseId", "Please include a course id").exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ hasErrors: true, errors: errors.array() });
    }

    const { users, courseId } = req.body;

    try {
      await User.updateMany({ 'matricule': users }, { $push: { courses: courseId } });
      res.json({ hasErrors: false });
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
    }
  }
);

// @route   GET api/user
// @desc    Get user's infos
// @access  Public
router.get("/", [auth], async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ "_id": req.userId })
      .populate({ path: "courses", populate: { path: "processors", populate: { path: "problems" } } })
      .populate("answers");
    res.json({ hasErrors: false, payload: user});
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ hasErrors: true, errors: ["Server Error: " + err.message] });
  }
});


// @route   POST api/user/reset
// @desc    POST delete all users
// @access  Public
router.post("/reset", async (req: Request, res: Response) => {
  try {
    const response = await User.deleteMany({ role: { $nin: ["ADMIN", "TEACHER"] } });
    console.log("supposed to remove everything here")
    res.json({ hasErrors: false });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ hasErrors: true, errors: ["Server Error: " + err.message] });
  }
});

// @route   GET api/user/all
// @desc    Get all users
// @access  Public
router.get("/all", [auth], async (req: Request, res: Response) => {
  try {
    const users = await User.find({ username: { $nin: ["admin", "test", "default"] } });
    res.json({ hasErrors: false, payload: users });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ hasErrors: true, errors: ["Server Error: " + err.message] });
  }
});

// @route   POST api/user/remove
// @desc    Post all users
// @access  Public
router.post("/remove",
  [auth,
    check("matricules", "Please include valid matricules").isArray({ min: 1 }),
  ], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ hasErrors: true, errors: errors.array() });
    }
    console.log('🚀 ~ ], ~ req.body.matricules', req.body.matricules);
    try {
      await User.deleteMany({ matricule: { $in: req.body.matricules } });
      res.json({ hasErrors: false });
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ hasErrors: true, errors: ["Server Error: " + err.message] });
    }
  });

export default router;
