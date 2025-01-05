import showToaster from "./showToaster.js";

function errorHandler(errorCode, errorElementStateHandler) {
    switch (errorCode) {
        case "FIELDS_MISSING":
            showToaster("Fields are missing !", "text-red-400", errorElementStateHandler);
            break;

        case "INVALID_EMAIL":
            showToaster("Email is invalid !", "text-red-400", errorElementStateHandler);
            break;

        case "USER_ALREADY_REGISTERED":
            showToaster("User already registered !", "text-red-400", errorElementStateHandler);
            break;

        case "CHANNEL_HANDLE_ALREADY_EXISTS":
            showToaster("Channel handle already exists !", "text-red-400", errorElementStateHandler);
            break;

        case "AVATAR_NOT_UPLOADED":
            showToaster("Avatar not uploaded !", "text-red-400", errorElementStateHandler);
            break;

        case "IMAGES_NOT_UPLOADED":
            showToaster("Images not uploaded !", "text-red-400", errorElementStateHandler);
            break;

        case "MEDIA_FILES_NOT_UPLOADED":
            showToaster("Media files not uploaded !", "text-red-400", errorElementStateHandler);
            break;

        case "FIRST_FILE_IMAGE_ONLY":
            showToaster("First file has to be an image !", "text-red-400", errorElementStateHandler);
            break;

        case "SECOND_FILE_VIDEO_ONLY":
            showToaster("Second file has to be a video !", "text-red-400", errorElementStateHandler);
            break;

        case "AVATAR_NOT_IMAGE":
            showToaster("Avatar should be an image only !", "text-red-400", errorElementStateHandler);
            break;

        case "NOT_IMAGE_ERROR":
            showToaster("Uploaded file should be an image only !", "text-red-400", errorElementStateHandler);
            break;

        case "AVATAR_FILE_EXCEEDED":
            showToaster("Avatar size should be only upto 2mb !", "text-red-400", errorElementStateHandler);
            break;

        case "IMAGE_SIZE_EXCEEDED":
            showToaster("Image size should be only upto 2mb !", "text-red-400", errorElementStateHandler);
            break;

        case "CATEGORY_NOT_SELECTED":
            showToaster("Please select a category !", "text-red-400", errorElementStateHandler);
            break;

        case "VIDEO_SIZE_EXCEEDED":
            showToaster("Video size should be only upto 100mb !", "text-red-400", errorElementStateHandler);
            break;

        case "COVER_IMAGE_NOT_IMAGE":
            showToaster("Cover image should be an image only !", "text-red-400", errorElementStateHandler);
            break;

        case "COVER_IMAGE_FILE_EXCEEDED":
            showToaster("Cover image size should be only upto 2mb !", "text-red-400", errorElementStateHandler);
            break;

        case "REGISTRATION_ERROR":
            showToaster("An error occurred while registering the user. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "CREATE_CHANNEL_ERROR":
            showToaster("An error occurred while creating the channel. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "UPDATE_CHANNEL_ERROR":
            showToaster("An error occurred while updating the channel. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "USER_NOT_REGISTERED":
            showToaster("User not registered !", "text-red-400", errorElementStateHandler);
            break;

        case "INVALID_PASSWORD":
            showToaster("Password is invalid !", "text-red-400", errorElementStateHandler);
            break;

        case "LOGIN_ERROR":
            showToaster("An error occurred while login. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "LOGOUT_ERROR":
            showToaster("An error occurred while logout. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "ADD_COMMENT_ERROR":
            showToaster("An error occurred while adding comment. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "COMMENT_MESSAGE_MISSING":
            showToaster("Comment message is missing !", "text-red-400", errorElementStateHandler);
            break;

        case "UNAUTHORISED_ERROR":
            showToaster("Sorry ! You are not authorised to perform this operation.", "text-red-400", errorElementStateHandler);
            break;

        case "UPDATE_COMMENT_ERROR":
            showToaster("An error occurred while updating comment. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "VIDEO_UPLOAD_ERROR":
            showToaster("An error occurred while uploading your video. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "DELETE_COMMENT_ERROR":
            showToaster("An error occurred while deleting comment. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "LIKE_DISLIKE_UPDATE_ERROR":
            showToaster("An error occurred while updating the like and dislike operation. Retry please !", "text-red-400", errorElementStateHandler);
            break;

        case "GET_CHANNEL_ERROR":
            showToaster("An error occurred while getting channel information. Please reload the page !", "text-red-400", errorElementStateHandler);
            break;

        case "CHANNEL_NOT_FOUND":
            showToaster("Channel not found !", "text-red-400", errorElementStateHandler);
            break;

        case "NO_FIELDS_UPDATED":
            showToaster("Atleast one field should be updated !", "text-red-400", errorElementStateHandler);
            break;

        case "FIELDS_EMPTY":
            showToaster("Fields cannot be empty !", "text-red-400", errorElementStateHandler);
            break;

        case "UPDATE_VIDEO_ERROR":
            showToaster("An error occurred while updating video. Retry please !", "text-red-400", errorElementStateHandler);
            break;
    }
}

export default errorHandler;