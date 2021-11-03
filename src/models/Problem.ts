import { Document, Model, model, Schema } from "mongoose";
import { ICourse } from "./Course";
import { IProcessor } from "./Processor";

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
  question: string;
  processors: [IProcessor["_id"]];
  answers?: [string];
  isAdmin: boolean;
}

const problemSchema: Schema = new Schema({

  title: {
    type: String,
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
  processors: [{
    type: Schema.Types.ObjectId,
    ref: "Processor"
  }],
  answers: {
    type: [String]
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const Problem: Model<IProblem> = model("Problem", problemSchema);

export default Problem;
