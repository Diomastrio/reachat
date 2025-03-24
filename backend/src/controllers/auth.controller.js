import { verifyRecaptcha } from "../lib/recaptcha.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import ResetToken from "../models/resetToken.model.js";
import { sendPasswordResetEmail } from "../lib/nodemailer.js";

export const signup = async (req, res) => {
  const { fullName, email, password, recaptchaToken } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!recaptchaToken) {
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification required" });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  try {
    if (!recaptchaToken) {
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification required" });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Session cerrada correctamente" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "El correo electrónico es requerido" });
    }

    const user = await User.findOne({ email });

    // Always return a success response even if email doesn't exist
    // This is for security reasons to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message:
          "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
      });
    }

    // Delete any existing reset tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Create a new token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save the token to the database
    await new ResetToken({
      userId: user._id,
      token: resetToken,
    }).save();

    // Send the password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      message:
        "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
    });
  } catch (error) {
    console.log("Error in forgotPassword controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    res.status(200).json({ message: "Token válido" });
  } catch (error) {
    console.log("Error in verifyResetToken controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the reset token
    await ResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
