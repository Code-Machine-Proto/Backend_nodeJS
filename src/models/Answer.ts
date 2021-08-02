import { Document, Model, model, Schema } from "mongoose";
import { IProblem } from './Problem';
import { IUser } from "./User";

/**
 * Interface to model the User Schema for TypeScript.
 * @param user:UserId
 * @param problem:ProblemId
 * @param content:string
 */
export interface IAnswer extends Document {
  user: IUser["_id"];
  problem: IProblem["_id"];
  content: string;
}

const answerSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: "Problem"
  },
  content: [{
    type: String,
  }]
});

const Answer: Model<IAnswer> = model("Answer", answerSchema);

export default Answer;