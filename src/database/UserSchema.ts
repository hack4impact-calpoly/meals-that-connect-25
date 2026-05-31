import { USER_ROLES } from "@/lib/types";
import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "Admin" | "Dining Site Staff" | "Kitchen Staff";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  role: UserRole;
  lastLoginDate?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: false },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "Dining Site Staff",
    },
    lastLoginDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
