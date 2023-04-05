import { Document, Model, model, Schema } from "mongoose";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param processors:[objectId]
 */
export interface ICourse extends Document {
  name: string;
  processors: [Schema.Types.ObjectId];
}

const courseSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  processors: [{
    type: Schema.Types.ObjectId,
    ref: "Processor"
  }]
});

const Course: Model<ICourse> = model("Course", courseSchema);

export default Course;
