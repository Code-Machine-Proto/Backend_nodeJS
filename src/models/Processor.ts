import { Document, Model, model, Schema } from "mongoose";
import { ICourse } from "./Course";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param problems:[objectId]
 */
export interface IProcessor extends Document {
  name: string;
  type: number;
  problems: [Schema.Types.ObjectId];
  courses: [ICourse["_id"]];
}

const processorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: Number,
    required: true
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: "Course"
  }]
  ,
  problems: [{
    type: Schema.Types.ObjectId,
    ref: "Problem"
  }]
});

const Processor: Model<IProcessor> = model("Processor", processorSchema);

export default Processor;
