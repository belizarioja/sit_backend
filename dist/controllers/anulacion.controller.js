"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAnulacion = void 0;
const moment_1 = __importDefault(require("moment"));
// DB
const database_1 = require("../database");
function setAnulacion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req;
            const { numerodocumento, observacion } = req.body;
            if (numerodocumento.length < 11) {
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 2,
                        message: 'Valor de NUMERO DOCUMENTO NO VALIDO!'
                    }
                });
            }
            const fechaanulado = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
            const sqlupd = " update t_registros set estatus = 2,  observacion = $3, fechaanulado = $4 ";
            const whereupd = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)
            const respupd = yield database_1.pool.query(sqlupd + whereupd, [id, numerodocumento, observacion, fechaanulado]);
            if (respupd.rowCount === 1) {
                const data = {
                    success: true,
                    error: null,
                    data: {
                        message: 'Documento ANULADO con éxito!'
                    }
                };
                return res.status(200).json(data);
            }
            else {
                const data = {
                    success: false,
                    data: null,
                    error: {
                        code: 3,
                        message: 'NUMERO DOCUMENTO no corresponde al tipo ni al cliente emisor!'
                    }
                };
                return res.status(202).json(data);
            }
        }
        catch (e) {
            return res.status(400).send('Error Anulando Documento ' + e);
        }
    });
}
exports.setAnulacion = setAnulacion;
