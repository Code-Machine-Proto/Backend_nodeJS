import { Document, Model, model, Schema } from "mongoose";
import Answer, { IAnswer } from "./Answer";
import Course, { ICourse } from "./Course";

/**
 * Interface to model the User Schema for TypeScript.
 * @param username:string
 * @param password:string
 * @param lastConnection:date
 */
export interface IUser extends Document {
  email: string;
  matricule: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  lastConnection: Date;
  courses: [ICourse["_id"]];
  answers: [IAnswer["_id"]];
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  matricule: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastConnection: {
    type: Date,
    default: Date.now
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: Course,
  }],
  answers: [{
    type: Schema.Types.ObjectId,
    ref: Answer,
  }],
});

const User: Model<IUser> = model("User", userSchema);

export default User;
