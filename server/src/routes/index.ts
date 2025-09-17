import { Router } from "express";
import recipes from "./recipes.routes";
import reviews from "./reviews.routes";

const api = Router();

api.use("/recipes", recipes);
api.use("/recipes", reviews);

export default api;