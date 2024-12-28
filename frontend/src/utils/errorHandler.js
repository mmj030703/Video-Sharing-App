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

        case "AVATAR_NOT_UPLOADED":
            showToaster("Avatar not uploaded !", "text-red-400", errorElementStateHandler);
            break;

        case "AVATAR_NOT_IMAGE":
            showToaster("Avatar should be an image only !", "text-red-400", errorElementStateHandler);
            break;

        case "AVATAR_FILE_EXCEEDED":
            showToaster("Avatar size should be only upto 2mb !", "text-red-400", errorElementStateHandler);
            break;

        case "REGISTRATION_ERROR":
            showToaster("An error occurred while registering the user. Retry please !", "text-red-400", errorElementStateHandler);
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
    }
}

export default errorHandler;