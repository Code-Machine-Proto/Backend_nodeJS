import { Document, Model, model, Schema } from "mongoose";
import { IAnswer } from "./Answer";
import { ICourse } from "./Course";
import { IUser } from "./User";

/**
 * Interface to model the Profile Schema for TypeScript.
 * @param user:ref => User._id
 * @param courses:ref => [Course._id]
 * @param answer:ref => [Answer._id]
 */
export interface IProfile extends Document {
  user: IUser["_id"];
  courses: [ICourse["_id"]];
  answers: [IAnswer["_id"]];
}

const profileSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: "Course",
  }],
  answers: [{
    type: Schema.Types.ObjectId,
    ref: "answers",
  }],

});

const Profile: Model<IProfile> = model("Profile", profileSchema);

export default Profile;
