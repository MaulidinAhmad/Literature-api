const { User } = require("../../models");
// Get User Function
exports.getUser = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery } = req.query;

    const page = pageQuery ? pageQuery - 1 : 0;
    const pageSize = parseInt(limitQuery ? limitQuery : 10);

    const paginate = ({ page, pageSize }) => {
      const offset = page * pageSize;
      const limit = pageSize;

      return {
        offset,
        limit,
      };
    };
    const data = await User.findAll(
      Object.assign(
        {
          order: [["id", "DESC"]],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        paginate({ page, pageSize })
      )
    );
    res.send({
      message: "Successfuly Fetch User Data",
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Delete User Function
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).send({
        error: {
          message: "No User Found",
        },
      });
    }
    await user.destroy();
    res.send({
      message: "Successfully Delete User",
      data: {
        id,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Change Profile Picture
exports.uploadProfileImg = async (req, res) => {
  // console.log(req.file);
  try {
    // console.log(req.file.filename);
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (!user) {
      res.status(404).send({ error: { message: "Data Not Found" } });
    }
    const result = await user.update({
      img: req.file.filename,
    });
    res.send({
      message: "Successfully Upload Profile Image",
      data: result.img,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
