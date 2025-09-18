import { Router } from "express";
import recipes from "./recipes.routes";
import reviews from "./reviews.routes";
import auth from "./auth.routes";

const api = Router();

api.use("/auth", auth);
api.use("/recipes", recipes);
api.use("/recipes", reviews);

export default api;