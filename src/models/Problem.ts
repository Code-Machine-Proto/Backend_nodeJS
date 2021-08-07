import { Document, Model, model, Schema } from "mongoose";
import { ICourse } from "./Course";

/**
 * Interface to model the User Schema for TypeScript.
 * @param title:string
 * @param type:string
 * @param id:string
 * @param processor:string
 * @param question:string
 * @param courses:[Course._id]
 * @param answer?:string
 */
export interface IProblem extends Document {
  title: string;
  type: string;
  processor: number;
  question: string;
  courses: [ICourse["_id"]];
  answers?: [string];
}

const problemSchema: Schema = new Schema({

  title: {
    type: String,
    unique: true,
    required: true
  },
  processor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  
  },
  question: {
    type: String,
    required: true
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: "Course"
  }],
  answers: {
    type: [String]
  }
});

const Problem: Model<IProblem> = model("Problem", problemSchema);

export default Problem;
