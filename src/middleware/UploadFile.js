const multer = require("multer");
exports.upload = (fileFields) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/literature/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname.replace(" ", "-"));
    },
  });

  const imageFilter = function (req, file, cb) {
    if (file.fieldname === "file") {
      if (!file.originalname.match(/\.(PDF|pdf)$/)) {
        req.fileValidationError = {
          message: "Only PDF or EPUB File Allowed",
        };
        return cb(new Error("Only Pdf Or Epub files are allowed!"), false);
      }
    } else {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {
          message: "Only image files are allowed!",
        };
        return cb(new Error("Only image files are allowed!"), false);
      }
    }
    cb(null, true);
  };

  const maxSize = 2 * 1000 * 1000;

  const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(fileFields);

  return (req, res, next) => {
    upload(req, res, function (err) {
      if (req.fileValidationError)
        return res.status(400).send(req.fileValidationError);

      if (!req.file && !err)
        return res.status(400).send({
          message: "Please select an image to upload",
        });

      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            message: "Max file sized 2MB",
          });
        }
        return res.status(400).send(err);
      }

      return next();
    });
  };
};
