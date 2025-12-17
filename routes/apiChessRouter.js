"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createList = (points) => {
    if (points.length > 0) {
        let now = new Date();
        let currentMonth = (now.getFullYear() - 2010) * 12 + now.getMonth();
        let ratingArray = [];
        for (let i = 0; i < points.length; i++) {
            let timestamp = (points[i][0] - 2010) * 12 + points[i][1];
            let rating = points[i][3];
            if (ratingArray[timestamp] == undefined || ratingArray[timestamp] < rating) {
                ratingArray[timestamp] = rating;
            }
        }
        for (let i = 0; i < currentMonth; i++) {
            if (ratingArray[i] == undefined) {
                ratingArray[i] = null;
            }
        }
        return ratingArray;
    }
    return [];
};
const findVariant = (data) => {
    let variants = [];
    for (let i = 0; i < 14; i++) {
        variants[i] = data[i].points.length;
    }
    return variants.indexOf(Math.max(...variants));
};
const chessRouter = express_1.default.Router();
chessRouter.use(express_1.default.json());
chessRouter.get("/ratings", async (req, res, next) => {
    if (String(req.query.username) != "undefined" && String(req.query.username) != "") {
        try {
            const connection = await fetch(`https://lichess.org/api/user/${req.query.username}/rating-history`, { method: "GET" });
            let variantNumber;
            switch (req.query.variant) {
                case ("UltraBullet"):
                    variantNumber = 0;
                    break;
                case ("Bullet"):
                    variantNumber = 1;
                    break;
                case ("Blitz"):
                    variantNumber = 2;
                    break;
                case ("Rapid"):
                    variantNumber = 3;
                    break;
                case ("Classical"):
                    variantNumber = 4;
                    break;
                case ("Correspondence"):
                    variantNumber = 5;
                    break;
                case ("Crazyhouse"):
                    variantNumber = 6;
                    break;
                case ("Chess960"):
                    variantNumber = 7;
                    break;
                case ("King of the Hill"):
                    variantNumber = 8;
                    break;
                case ("Three-check"):
                    variantNumber = 9;
                    break;
                case ("Antichess"):
                    variantNumber = 10;
                    break;
                case ("Atomic"):
                    variantNumber = 11;
                    break;
                case ("Horde"):
                    variantNumber = 12;
                    break;
                case ("Racing Kings"):
                    variantNumber = 13;
                    break;
                case ("Puzzles"):
                    variantNumber = 14;
                    break;
                default:
                    variantNumber = -1;
                    break;
            }
            if (variantNumber == -1) {
                let fullData = await connection.json();
                let list = createList((fullData)[findVariant(fullData)].points);
                let variantNum = findVariant(fullData);
                res.json({ data: list, variant: variantNum });
            }
            else {
                let data = createList((await connection.json())[variantNumber].points);
                res.json({ data: data, variant: variantNumber });
            }
        }
        catch {
            res.json({ "virhe": `käyttäjää '${req.query.username}' ei löydy` });
        }
    }
    else {
        res.json({ data: [], variant: -1 });
    }
});
chessRouter.post("/history", async (req, res, next) => {
    return prisma.haku.create({
        data: {
            aikaleima: req.body.aikaleima,
            nimi1: req.body.nimi1,
            variant1: req.body.variant1,
            maxRating1: req.body.maxRating1,
            nimi2: req.body.nimi2,
            variant2: req.body.variant2,
            maxRating2: req.body.maxRating2,
        }
    });
});
chessRouter.get("/history", async (req, res, next) => {
    try {
        res.json(await prisma.haku.findMany());
    }
    catch (e) {
        throw new Error;
    }
});
chessRouter.delete("/history/:id", async (req, res, next) => {
    if (await prisma.haku.count({
        where: {
            id: Number(req.params.id)
        }
    }) === 1) {
        try {
            await prisma.haku.delete({
                where: {
                    id: Number(req.params.id)
                }
            });
            res.json(await prisma.haku.findMany());
        }
        catch (e) {
            throw new Error;
        }
    }
    else {
        throw new Error;
    }
});
exports.default = chessRouter;
