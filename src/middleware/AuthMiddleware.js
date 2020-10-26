const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_KEY || "ngodingsampekmampus0k0k";

exports.authenticated = (req, res, next) => {
  let header, token;

  //   check if header present with barier
  if (
    !(header = req.header("Authorization")) ||
    !(token = header.replace("Bearer ", ""))
  ) {
    return res.status(400).send({ error: { message: "Access Denied " } });
  }

  try {
    //   check if token exist
    const verified = jwt.verify(token, jwtKey);
    req.user = verified;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "You Not Allowed To Access" } });
  }
};
