const { Literature, User, Collection } = require("../../models");

exports.getCollections = async (req, res) => {
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
    const data = await Collection.findAll(
      Object.assign(
        {
          where: { userId: req.user.id },
        },
        {
          order: [["id", "DESC"]],
          include: [
            {
              // Relation To Category
              as: "literature",
              model: Literature,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
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
            },
          ],
        },
        paginate({ page, pageSize })
      )
    );
    res.send({ message: "Successfully Fetch Collection Data", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
exports.getCollection = async (req, res) => {
  try {
    const { bookId } = req.query;
    let filter = { userId: req.user.id };
    if (bookId) {
      filter.literatureId = bookId;
    }
    const data = await Collection.findOne({
      where: filter,
      order: [["id", "DESC"]],
    });

    res.send({ message: "Successfully Fetch Collection Data", data });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      error: {
        message: "Server Error",
      },
    });
  }
};
exports.addCollection = async (req, res) => {
  try {
    const data = await Collection.create({ ...req.body, userId: req.user.id });
    res.send({ message: "Successfully Add Collection", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
exports.deleteCollection = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Collection.findOne({
      where: { literatureId: id, userId: req.user.id },
    });
    if (!data) {
      return res
        .status(404)
        .send({ error: { message: "Collection Not Found" } });
    }
    await data.destroy();
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: "Server Error" } });
  }
};
