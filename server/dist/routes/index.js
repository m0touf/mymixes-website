"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recipes_routes_1 = __importDefault(require("./recipes.routes"));
const reviews_routes_1 = __importDefault(require("./reviews.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const anonymous_reviews_routes_1 = __importDefault(require("./anonymous-reviews.routes"));
const qr_routes_1 = __importDefault(require("./qr.routes"));
const api = (0, express_1.Router)();
api.use("/auth", auth_routes_1.default);
api.use("/recipes", recipes_routes_1.default);
api.use("/recipes", reviews_routes_1.default);
api.use("/recipes", anonymous_reviews_routes_1.default); // Anonymous reviews route
api.use("/qr", qr_routes_1.default); // QR token management
exports.default = api;
