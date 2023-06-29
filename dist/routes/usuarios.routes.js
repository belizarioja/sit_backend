"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarios_controller_1 = require("../controllers/usuarios.controller");
const router = (0, express_1.Router)();
router.route('/')
    .get(usuarios_controller_1.getUsuarios);
router.route('/')
    .post(usuarios_controller_1.setUsuarios);
router.route('/login')
    .post(usuarios_controller_1.getLogin);
router.route('/roles')
    .get(usuarios_controller_1.getRoles);
router.route('/estatus/:id')
    .put(usuarios_controller_1.updateEstatus);
router.route('/cambioclave/:id')
    .put(usuarios_controller_1.updateClave);
exports.default = router;
