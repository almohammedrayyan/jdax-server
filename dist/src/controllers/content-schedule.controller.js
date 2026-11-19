"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContentSchedule = exports.updateContentSchedule = exports.getContentScheduleById = exports.getContentSchedules = exports.createContentSchedule = void 0;
const service = __importStar(require("../services/content-schedule.service"));
function sendError(res, error) {
    const knownError = error;
    const status = knownError.statusCode || 500;
    if (status === 500)
        console.error("Content schedule error:", error);
    return res.status(status).send({ success: false, message: knownError.message || "Something went wrong.", data: null });
}
const createContentSchedule = async (req, res) => {
    try {
        const data = await service.create(req.body);
        return res.status(201).send({ success: true, message: "Content schedule created.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.createContentSchedule = createContentSchedule;
const getContentSchedules = async (req, res) => {
    try {
        const data = await service.getAll(req.query);
        return res.status(200).send({ success: true, message: "Content schedules fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.getContentSchedules = getContentSchedules;
const getContentScheduleById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule fetched.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.getContentScheduleById = getContentScheduleById;
const updateContentSchedule = async (req, res) => {
    try {
        const data = await service.update({ ...req.body, _id: req.params.id });
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule updated.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.updateContentSchedule = updateContentSchedule;
const deleteContentSchedule = async (req, res) => {
    try {
        const data = await service.remove(req.params.id);
        if (!data)
            return res.status(404).send({ success: false, message: "Content schedule not found.", data: null });
        return res.status(200).send({ success: true, message: "Content schedule deleted.", data });
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.deleteContentSchedule = deleteContentSchedule;
