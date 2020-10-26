const router = require("express").Router();

// User Controller
const {
  deleteUser,
  getUser,
  uploadProfileImg,
} = require("../controllers/UserController");

// Book Controller
const {
  getLiteratures,
  getUserLiteratures,
  getLiterature,
  updateLiterature,
  deleteLiterature,
  addLiterature,
  setApprove,
  setCancel,
  downloadLiterature,
  getMinAndMaxYear,
} = require("../controllers/LiteratureController");

// Image Upload Middleware
const { upload } = require("../middleware/UploadFile");
const { uploadProfile } = require("../middleware/ProfileUpload");

// User Controller
const { login, register, checkAuth } = require("../controllers/AuthController");

// Library Controller
const {
  addCollection,
  getCollection,
  getCollections,
  deleteCollection,
} = require("../controllers/CollectionController");

// Middleware Controller
const { authenticated } = require("../middleware/AuthMiddleware");
const { adminAuth } = require("../middleware/AdminMiddleware");

// Auth Routes
router.post("/register", register);
router.post("/login", login);

// Route Middleware
// router.use(authenticated);
// Check Auth Routes
router.get("/auth", authenticated, checkAuth);
// User Routes
router.get("/users", authenticated, getUser);
router.post(
  "/user/uploadimage",
  authenticated,
  uploadProfile("profileImg"),
  uploadProfileImg
);
router.delete("/user/:id", authenticated, adminAuth, deleteUser);
// Literature Routes
router.get("/literatures", authenticated, getLiteratures);
router.get("/userliteratures", authenticated, getUserLiteratures);
router.get("/getyearrange", authenticated, getMinAndMaxYear);
router.get("/literature/:id", authenticated, getLiterature);
router.post("/literature", authenticated, upload("file"), addLiterature);
router.patch("/literature/:id", authenticated, updateLiterature);
router.patch("/literature/approve/:id", authenticated, adminAuth, setApprove);
router.patch("/literature/cancel/:id", authenticated, adminAuth, setCancel);
router.delete("/literature/:id", authenticated, deleteLiterature);
router.get("/literature/download/:name", authenticated, downloadLiterature);

// Library Routes
router.get("/collections", authenticated, getCollections);
router.get("/collection", authenticated, getCollection);
router.delete("/collection/:id", authenticated, deleteCollection);
router.post("/collection", authenticated, addCollection);

module.exports = router;
