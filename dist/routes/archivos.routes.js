"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const archivos_controller_1 = require("../controllers/archivos.controller");
const router = (0, express_1.Router)();
router.route('/:rif/:anniomes/:rifid').get(archivos_controller_1.getFactura);
router.route('/utils/:img').get(archivos_controller_1.getUtils);
exports.default = router;
