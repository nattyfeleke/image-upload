import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;
// Use the uploads directory from the root
const uploadDir = path.resolve(process.env.UPLOADS_DIR || "uploads");
// Multer setup for storing uploaded files
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); // Ensure the directory exists
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase(); // Extract the file extension
      console.log(`ext`, ext);

      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Generate a filename with the extension
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter(req: Request, file: Express.Multer.File, cb: Function) {
    // Accept only image files
    const allowedTypes = /jpg|jpeg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only images are allowed."));
  },
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(uploadDir));
app.get("/", (req: Request, res: Response) => {
  res.send("Image upload!");
});

// API endpoint to upload image
app.post(
  "/upload",
  upload.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).send({ message: "No file uploaded" });
      return next();
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.status(200).send({ imageUrl });
    return next();
  }
);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send({ message: err.message });
  } else {
    res.status(500).send({ message: "Server error", error: err.message });
  }
  // No need to return anything here as response is already sent
};

app.use(errorHandler);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
