require("dotenv").config();
const express=require("express");
const app=express();
const uuid=require('uuid').v4;
const { s3Uploadv2, s3Uploadv3 } = require("./s3service");

const multer=require('multer')
 /* const storage = multer.diskStorage({
 destination: (req, file, cb) => {
     cb(null, "uploads");
  },
 filename: (req, file, cb) => {
     const { originalname } = file;
     cb(null, `${uuid()}-${originalname}`);
}});*/

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// ["image", "jpeg"]

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
});
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "file is too large",
        });
      }
  
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          message: "File limit reached",
        });
      }
  
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: "File must be an image",
        });
      }
    }
  });
app.post("/upload",upload.array("file"),async (req,res)=>{
  console.log(req.files);
  //const results = await s3Uploadv2(req.files);
  const results = await s3Uploadv3(req.files);

  console.log(results);
    res.json({"success":"uploaded"});
})

app.listen(3000,()=>{console.log("listening on port 3000")})