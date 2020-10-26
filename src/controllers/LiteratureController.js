const { Literature, Category, User, sequelize } = require("../../models");
const Joi = require("joi");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const fs = require("fs");

// Joi Schema
const schema = Joi.object({
  title: Joi.string().min(3).required(),
  publication: Joi.string().required(),
  pages: Joi.number().required(),
  ISBN: Joi.number().required(),
  author: Joi.string().required(),
});

// Get All Literature Function
exports.getLiteratures = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      literatureId,
      status,
      name,
      year,
    } = req.query;

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

    let filter = {};
    if (literatureId) {
      filter.literatureId = literatureId;
    }

    console.log(page, pageSize);
    if (name) {
      let newName = "";
      if (name == "all") {
        newName = "";
      } else {
        newName = name;
      }
      filter.title = {
        [Op.like]: `%${newName}%`,
      };
    }
    if (year) {
      let newYear = "";
      if (year == "all") {
        newYear = "";
      } else {
        newYear = year;
      }
      filter.year = {
        [Op.gte]: newYear,
      };
    }
    if (status) {
      filter.status = status;
    }

    // Find All Using Sequilize
    const data = await Literature.findAll(
      Object.assign(
        {
          where: filter,
        },
        {
          order: [["id", "DESC"]],
          // Using Relation
          include: [
            {
              // Relation To User
              as: "user",
              model: User,
              attributes: {
                exclude: ["createdAt", "password", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        paginate({
          page,
          pageSize,
        })
      )
    );

    // Send Success Response
    res.send({
      message: "Successfully Fetch Literature Data",
      data,
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Handle Approve
exports.setApprove = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Literature.findOne({ where: { id } });
    if (!data) {
      res.status(404).send({
        error: { message: "Data Not Found" },
      });
    }
    await data.update({ status: "Approved" });
    // send response
    res.send({
      message: "Successfully Update Status",
      data: {
        id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
// Handle Cancel
exports.setCancel = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Literature.findOne({ where: { id } });
    if (!data) {
      res.status(404).send({
        error: { message: "Data Not Found" },
      });
    }
    await data.update({ status: "Canceled" });
    // send response
    res.send({
      message: "Successfully Update Status",
      data: {
        id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
// Get User Literatures
exports.getUserLiteratures = async (req, res) => {
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
    // Find All User Using Sequilize
    const data = await Literature.findAll(
      Object.assign(
        {
          where: { userId: req.user.id },
        },
        {
          order: [["id", "DESC"]],
          // Using Relation
          include: [
            {
              // Relation To User
              as: "user",
              model: User,
              attributes: {
                exclude: ["createdAt", "password", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        paginate({ page, pageSize })
      )
    );
    // Send Success Response
    res.send({
      message: "Data Successfully Fetched",
      data,
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Update Literature Function
exports.updateLiterature = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Data
    const { error } = await schema.validate(req.body);
    // Return if Data Not Valid
    if (error) {
      return res
        .status(400)
        .send({ error: { message: error.details[0].message } });
    }
    // Get Selected Literature
    const selectedLiterature = await Literature.findOne({ where: { id } });
    // Return If Data Not Exist
    if (!selectedLiterature) {
      return res.status(404).send({ error: { message: "Data Not Found" } });
    }
    // Update Literature
    await selectedLiterature.update(req.body);
    // Get All Updated Data
    const data = await Literature.findOne({
      where: {
        id,
      },
      // Using Relation
      include: [
        {
          // Relation To Category
          as: "category",
          model: Category,
          attrbutes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          // Relation To User
          as: "user",
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "categoryId"],
      },
    });
    // Send Success Response
    res.send({
      message: `Succesfuly Update data with id ${id}`,
      data,
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Get One Literature Function
exports.getLiterature = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Literature.findOne({
      where: {
        id,
      },
      // Using Relation
      include: [
        {
          // Relation To User
          as: "user",
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId", "categoryId"],
      },
    });
    // Check If Data Not Exist
    if (!data) {
      // Send Not Found Response
      return res.status(404).send({
        error: {
          message: "Data You Are Looking For Not Found",
        },
      });
    }
    // Send Success Response
    res.send({
      message: "Succesfuly Fetched data",
      data,
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Add Literature Function
exports.addLiterature = async (req, res) => {
  try {
    // Validate Data Using Joi
    const { error } = await schema.validate(req.body);
    // Send Response If Joi Error
    if (error) {
      return res.status(400).send({
        error: {
          message: error.details[0].message,
        },
      });
    }

    const date = req.body.publication.split(" ");
    console.log(date[2]);
    // Store Data
    const data = await Literature.create({
      ...req.body,
      userId: req.user.id,
      year: date[2],
      file: req.file.filename,
    });
    // Send Success Response
    res.send({
      message: "Successfully add data",
      data,
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Delete Literature Function
exports.deleteLiterature = async (req, res) => {
  try {
    const { id } = req.params;
    // get Selected Literature
    const selectedLiterature = await Literature.findOne({ where: { id } });
    // Return If Literature Not Exist
    if (!selectedLiterature) {
      return res.status(404).send({
        error: { message: "Data You Are Looking For Delete Not Found" },
      });
    }
    // Delete If Data Exist
    await selectedLiterature.destroy();

    // Send Success Response
    res.send({
      message: `Successfully delete data with id ${id}`,
      data: {
        id,
      },
    });
  } catch (err) {
    // Send Error Response
    console.log(err);
    res.status(500).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
// Get Min Year
exports.getMinAndMaxYear = async (req, res) => {
  try {
    const data = await Literature.findAll({
      attributes: [
        [Sequelize.fn("min", Sequelize.col("year")), "minYear"],
        [Sequelize.fn("max", Sequelize.col("year")), "maxYear"],
      ],
    });
    res.send({ message: "Successfully Get Range Data", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
// Download Literature
exports.downloadLiterature = async (req, res) => {
  const { name } = req.params;
  const file = `${__basedir}/uploads/literature/${name}`;
  // let filename = path.basename(file);
  // let mimetype = mime.lookup(file);

  // res.setHeader("Content-disposition", "attachment; filename=" + filename);
  // res.setHeader("Content-type", mimetype);

  fs.readFile(file, function (err, data) {
    if (err) return next(err);
    res.set("Content-Type", "image/jpeg");
    return res.status(200).end(data, "binary");
  });
  // let filestream = fs.createReadStream(file);
  // filestream.pipe(res);
  // res.sendFile(name, { root: file });
};
