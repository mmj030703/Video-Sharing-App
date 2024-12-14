import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

// try to handle this error "LIMIT_FILE_SIZE"
const imageUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedFiles = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/mpeg"]
        if (allowedFiles.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type! Only ${allowedFiles.join(", ")} files are allowed.`));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


// try to handle this error "LIMIT_FILE_SIZE"
const videoUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedFiles = ["video/mp4"]
        if (allowedFiles.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type! Only ${allowedFiles.join(", ")} file is allowed.`));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});