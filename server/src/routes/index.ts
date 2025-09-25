import { Router } from "express";
import recipes from "./recipes.routes";
import reviews from "./reviews.routes";
import auth from "./auth.routes";
import anonymousReviews from "./anonymous-reviews.routes";
import qr from "./qr.routes";
import image from "./image.routes";

const api = Router();

api.use("/auth", auth);
api.use("/recipes", recipes);
api.use("/recipes", reviews);
api.use("/recipes", anonymousReviews); // Anonymous reviews route
api.use("/qr", qr); // QR token management
api.use("/images", image); // Image upload

export default api;