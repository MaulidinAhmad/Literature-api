const { User } = require("../../models");
exports.adminAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });
    if (user.isAdmin == 0) {
      return res.status(500).send({ error: { message: "You Have No Access" } });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
