import mongoose from 'mongoose';

import { USER_ROLE_VALUES } from '../utils/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (document, returnedObject) => {
        void document;
        delete returnedObject.passwordHash;
        return returnedObject;
      },
    },
  },
);

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);