const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message: 'Success',
    data: {
      _id: user._id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    },
  });
};

const register = async (req, res, next) => {
  try {
    const { username, password, name, phone, securityQuestion, securityAnswer } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User with this username already exists' });
    }

    const user = await User.create({ username, password, name, phone, securityQuestion, securityAnswer });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that username' });
    }

    res.status(200).json({
      success: true,
      message: 'Security question found',
      data: { username: user.username, securityQuestion: user.securityQuestion },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;

    const user = await User.findOne({ username }).select('+securityAnswer +password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that username' });
    }

    const isAnswerMatch = await user.compareSecurityAnswer(securityAnswer);
    if (!isAnswerMatch) {
      return res.status(401).json({ success: false, message: 'Security answer is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };