import { Schema, model } from "mongoose";

export interface ILink {
  originalUrl: string;
  code: string;
  createdAt: Date;
}

const LinkSchema = new Schema<ILink>({
  originalUrl: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<ILink>("Link", LinkSchema);
