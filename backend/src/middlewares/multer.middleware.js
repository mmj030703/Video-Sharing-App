import multer from "multer";

const fileLimits = {
    video: 100 * 1024 * 1024,
    image: 2 * 1024 * 1024
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

// try to find type of upload morning
const dynamicUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        fileType = req.body.mediaFileType;

        if (!fileType || fileType.trim() === "") {
            cb(new Error("Please provide mediaFileType in request body."));
        }

        const allowedFiles = {
            image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
            video: ["video/mp4"]
        };

        if (allowedFiles[fileType].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type! Only ${allowedFiles[fileType].join(", ")} ${allowedFiles[fileType].length > 1 ? 'files are' : 'file is'} allowed.`));
        }
    }
});

export function validateFileSize(req, res, next) {
    try {
        const { mediaFileType } = req.body;

        if (!req.file && !req.files) {
            return res.status(400).send("Please upload all the file!");
        }

        if (req.file) {
            if (req.file.size > fileLimits[mediaFileType]) {
                return res.status(400).send(`File size should not exceed ${fileLimits[mediaFileType] / (1024 * 1024)} MB.`);
            }
        }

    } catch (error) {

    }
}