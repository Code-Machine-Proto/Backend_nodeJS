import { Document, Model, model, Schema } from "mongoose";
import { IProblem } from './Problem';
import { IUser } from "./User";

/**
 * Interface to model the User Schema for TypeScript.
 * @param keywords:[string]
 * @param theme:string
 */
export interface ISetting extends Document {
  keywords: string[];
  theme: string;
}

const settingSchema: Schema = new Schema({
  keywords: [{
    type: String,
  }],
  theme: {
    type: String,
  }
});

const Setting: Model<ISetting> = model("Setting", settingSchema);

export default Setting;
