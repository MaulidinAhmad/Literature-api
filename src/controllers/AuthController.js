// User Model
const { User } = require("../../models");
// Joi
const Joi = require("joi");
// import brcpt
const bcrypt = require("bcrypt");
// import JWT
const jwt = require("jsonwebtoken");
// JWT KEY
const jwtKey = process.env.JWT_KEY;

// Check Auth
exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });
    res.send({
      message: "User Valid",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: { message: "Access Forbidden" } });
  }
};
// Register function
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Joi Schema
    const schema = Joi.object({
      email: Joi.string().email().min(10).required(),
      password: Joi.string().min(8).required(),
      fullName: Joi.string().required().min(3),
      gender: Joi.string().required(),
      phone: Joi.number().min(10).required(),
      address: Joi.string().required(),
    });
    // make joi error const
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        error: {
          message: error.details[0].message,
        },
      });
    }

    // Check if email already exist
    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      return res.status(400).send({
        error: {
          message: "Email has been existed",
        },
      });
    }

    // Generate Hash Password
    const hashedPass = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({ ...req.body, password: hashedPass });

    // create new token
    const token = jwt.sign({ id: user.id }, jwtKey);
    // response
    res.send({
      message: "You has been registered",
      data: {
        email: user.email,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
// Login Function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //   Joi Scheme
    const schema = Joi.object({
      email: Joi.string().min(10).required().email(),
      password: Joi.string().min(8).required(),
    });

    const { error } = schema.validate(req.body);

    //   Return if joy validation true
    if (error) {
      return res.status(400).send({
        error: {
          message: error.details[0].message,
        },
      });
    }

    //   Select if email exist
    const user = await User.findOne({
      where: {
        email,
      },
    });

    // return if email not exist
    if (!user) {
      return res.status(400).send({
        error: {
          message: "Email or Password invalid",
        },
      });
    }
    // compare password with bcrypt
    const validPass = await bcrypt.compare(password, user.password);
    //   Return if password not valid
    if (!validPass) {
      return res.status(400).send({
        error: {
          message: "Email or Password invalid",
        },
      });
    }

    //   if email and pass exist create token
    const token = jwt.sign({ id: user.id }, jwtKey);

    //send new response
    res.send({
      message: "Login Success",
      data: {
        email: user.email,
        fullName: user.fullName,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
