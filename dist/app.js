"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Initialize the Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Use the uploads directory from the root
const uploadDir = path_1.default.resolve(process.env.UPLOADS_DIR || "uploads");
// Multer setup for storing uploaded files
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir); // Ensure the directory exists
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path_1.default.extname(file.originalname).toLowerCase(); // Extract the file extension
            console.log(`ext`, ext);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Generate a filename with the extension
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter(req, file, cb) {
        // Accept only image files
        const allowedTypes = /jpg|jpeg|png|gif/;
        // const mimeType = allowedTypes.test(file.mimetype);
        // const extname = allowedTypes.test(
        //   path.extname(file.originalname).toLowerCase()
        // );
        return cb(null, true);
        // if (mimeType && extname) {
        //   return cb(null, true);
        // }
        // cb(new Error("Invalid file type. Only images are allowed."));
    },
});
// Serve static files from the uploads directory
app.use("/uploads", express_1.default.static(uploadDir));
app.get("/", (req, res) => {
    res.send("Image upload!");
});
// API endpoint to upload image
app.post("/upload", upload.single("image"), (req, res, next) => {
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return next();
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).send({ imageUrl });
    return next();
});
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        res.status(400).send({ message: err.message });
    }
    else {
        res.status(500).send({ message: "Server error", error: err.message });
    }
    // No need to return anything here as response is already sent
};
app.use(errorHandler);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
