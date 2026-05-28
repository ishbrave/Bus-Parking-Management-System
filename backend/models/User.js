const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SECURITY_QUESTIONS = [
  'What is your mother\'s maiden name?',
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your favorite book?',
  'What is the name of your best childhood friend?',
  'What was the make of your first car?',
  'What is your favorite food?',
  'What is your dream destination?',
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 3,
      match: [/^[A-Za-z\s]+$/, 'Name must contain only alphabetic characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^(079|078|072|073)\d{7}$/, 'Phone must be a valid Rwandan number'],
    },
    securityQuestion: {
      type: String,
      required: [true, 'Security question is required'],
      enum: SECURITY_QUESTIONS,
    },
    securityAnswer: {
      type: String,
      required: [true, 'Security answer is required'],
      minlength: 3,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') && !this.isModified('securityAnswer')) return;
  const salt = await bcrypt.genSalt(10);
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('securityAnswer')) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  return bcrypt.compare(candidateAnswer, this.securityAnswer);
};

userSchema.statics.getSecurityQuestions = function () {
  return SECURITY_QUESTIONS;
};

module.exports = mongoose.model('User', userSchema);
