import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import config from "config";
import auth from "../../middleware/auth";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/User";

const router: Router = Router();

// @route   POST api/changePassword
// @desc    POST authenticated user given the token
// @access  Private
router.post("/changePassword",
  check("matricule", "Invalid_Username").isLength({ min: 6, max: 12 }),
  check("newPassword", "Invalid_Password").isLength({ min: 4, max: 12 })
, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ hasErrors: true, errors: errors.array() });
  }

  const {matricule, newPassword} = req.body

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await User.updateOne({matricule}, { password: hashed });
    res.json({ hasErrors: false });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
  }
  });

// @route   GET api/isUnique
// @desc    Get authenticated user given the token
// @access  Private
router.post("/isUnique", check("matricule", "Invalid_Username").isLength({ min: 6, max: 8 })
, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ hasErrors: true, errors: errors.array() });
  }
  try {
    const user: IUser = await User.findOne({matricule: req.body.matricule}).select("-password");
    res.json({ hasErrors: false, payload: user });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
  }
});

// @route   GET api/auth
// @desc    Get authenticated user given the token
// @access  Private
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const user: IUser = await User.findById(req.userId).select("-password");
    res.json({ hasErrors: false, payload: user });
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
  }
});

// @route   POST api/auth
// @desc    Login user and get token
// @access  Public
router.post(
  "/",
  [
    check("matricule", "Invalid_Username").isLength({min: 6, max: 8}),
    check("password", "Missing_Password").exists()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ hasErrors: true, errors: errors.array() });
    }

    const { matricule, password } = req.body;
    try {
      let user: IUser = await User.findOne({ matricule });

      if (!user) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          hasErrors: true,
          errors: [
            {
              msg: "Invalid_Credentials"
            }
          ]
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          hasErrors: true,

          errors: [
            {
              msg: "Invalid_Credentials"
            }
          ]
        });
      }

      const payload: Payload = {
        userId: user.id
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiration") },
        (err, token) => {
          if (err) throw err;
          res.json({hasErrors: false, payload: token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server_Error");
    }
  }
);

export default router;
