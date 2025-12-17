"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const apiChessRouter_1 = __importDefault(require("./routes/apiChessRouter"));
const app = (0, express_1.default)();
const portti = 3000;
app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
app.use(express_1.default.static(path_1.default.resolve(__dirname, "public")));
app.use("/api", apiChessRouter_1.default);
app.use((req, res, next) => {
    if (!res.headersSent) {
        res.status(404).json({ viesti: "Virheellinen reitti" });
    }
    next();
});
app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen: http://localhost:${portti}`);
});
