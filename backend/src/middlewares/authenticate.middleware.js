import jwt from "jsonwebtoken";

async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ error: null, message: "Token is required to authenticate !" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(400).json({ error: null, message: "Token is required to authenticate !" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decodedToken;

        next();

    } catch (error) {
        console.log("Token Invalid Error: ", error.message || error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: null, errorCode: "TOKEN_EXPIRED", message: "Token has expired, please login again!" });
        }

        return res.status(401).json({ error: null, errorCode: "INVALID_TOKEN", message: "Invalid token, please login again!" });
    }
}

export default authenticateUser;