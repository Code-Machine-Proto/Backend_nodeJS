import { Document, Model, model, Schema } from "mongoose";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param problems:[objectId]
 */
export interface ICourse extends Document {
  name: string;
  problems: [Schema.Types.ObjectId];
}

const courseSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  problems: [{
    type: Schema.Types.ObjectId,
    ref: "Problem"
  }]
});

const Course: Model<ICourse> = model("Course", courseSchema);

export default Course;
