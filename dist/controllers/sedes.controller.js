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
exports.updateEstatus = exports.updateSede = exports.getSedeCorelativo = exports.setSede = exports.getSedes = exports.getCodes = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SECRET = process.env.SECRET || '123456';
// DB
const database_1 = require("../database");
function getCodes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "select * ";
            const from = " from t_codigoscomercial ";
            const resp = yield database_1.pool.query(sql + from);
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Códigos comerciales ' + e);
        }
    });
}
exports.getCodes = getCodes;
function getSedes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "select a.* , b.codigocomercial  ";
            const from = " from t_serviciosmasivos a ";
            let leftjoin = " left join t_codigoscomercial b ON a.idcodigocomercial = b.id  ";
            const resp = yield database_1.pool.query(sql + from + leftjoin);
            const data = {
                success: true,
                data: resp.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Servicios masivos ' + e);
        }
    });
}
exports.getSedes = getSedes;
function setSede(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rif, razonsocial, direccion, email, telefono, enviocorreo, asignados, sitioweb } = req.body;
            const insert = "insert into t_serviciosmasivos (rif, razonsocial, direccion, email, telefono, enviocorreo, asignados, sitioweb, banner, estatus) ";
            const values = " values ($1, $2, $3, $4, $5, $6, $7, $8, 3, 1) RETURNING id";
            let resp = yield database_1.pool.query(insert + values, [rif, razonsocial, direccion, email, telefono, enviocorreo, asignados, sitioweb]);
            // console.log(resp.rows[0].id)
            const id = resp.rows[0].id;
            const datatoken = {
                id,
                rif,
                razonsocial,
                direccion,
                email,
                telefono
            };
            const tokenservicios = jsonwebtoken_1.default.sign({ user: datatoken }, SECRET);
            const sqlupd = "update t_serviciosmasivos set tokenservicios = $1 where id = $2 ";
            yield database_1.pool.query(sqlupd, [tokenservicios, id]);
            const insertselect = "INSERT INTO t_serviciosdoc (idserviciosmasivo, identificador, corelativo ) values ($1, 0, 0) ";
            yield database_1.pool.query(insertselect, [id]);
            // crear plantillas por defectos a clientes
            const insertplantilla = "INSERT INTO public.t_plantillacorreos(banner, colorfondo1, colorfondo2, colorfuente1, colorfuente2, idserviciosmasivo) VALUES ";
            const values1 = "('1', '#BCE4FA', '#EAF6FE', '#000000', '#575756', $1), ";
            const values2 = "('2', '#0d3b81', '#e3e4e5', '#FFFFFF', '#575756', $1), ";
            const values3 = "('3', '#FFFFFF', '#e3e4e5', '#575756', '#575756', $1);";
            yield database_1.pool.query(insertplantilla + values1 + values2 + values3, [id]);
            const archivoplantilla = path_1.default.join(__dirname, '../plantillas/factura.html');
            const datafile = fs_1.default.readFileSync(archivoplantilla);
            const nuevaplantilla = path_1.default.join(__dirname, '../plantillas/' + rif + '.html');
            if (fs_1.default.existsSync(archivoplantilla)) {
                // console.log('Existe!!!')
                fs_1.default.renameSync(archivoplantilla, nuevaplantilla);
                fs_1.default.writeFileSync(archivoplantilla, datafile);
            }
            const data = {
                success: true,
                resp: {
                    message: "Cliente Emisor creado con éxito"
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Servicios masivos ' + e);
        }
    });
}
exports.setSede = setSede;
function getSedeCorelativo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const sql = "SELECT identificador, corelativo FROM t_serviciosdoc WHERE idserviciosmasivo = $1";
            const resp = yield database_1.pool.query(sql, [id]);
            const identificador = resp.rows[0].identificador;
            const corelativo = resp.rows[0].corelativo;
            const sqllote = "SELECT * FROM t_tranzascorrelativo WHERE idserviciosmasivo = $1 order by id asc ";
            const resplote = yield database_1.pool.query(sqllote, [id]);
            const data = {
                success: true,
                identificador: identificador,
                corelativo: corelativo,
                data: resplote.rows
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Listando Corelativos de Servicios masivos ' + e);
        }
    });
}
exports.getSedeCorelativo = getSedeCorelativo;
function updateSede(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rif, razonsocial, direccion, email, telefono, enviocorreo, sitioweb, validarinterno, idcodigocomercial } = req.body;
            const { id } = req.params;
            const sqlupd = "update t_serviciosmasivos set rif = $1, razonsocial = $2, direccion = $3, email = $4, telefono = $5, enviocorreo = $6, sitioweb = $7, validarinterno = $8, idcodigocomercial= $9 where id = $10 ";
            yield database_1.pool.query(sqlupd, [rif, razonsocial, direccion, email, telefono, enviocorreo, sitioweb, validarinterno, idcodigocomercial, id]);
            const datatoken = {
                id,
                rif,
                razonsocial,
                direccion,
                email,
                telefono,
                enviocorreo,
                validarinterno
            };
            const tokenservicios = jsonwebtoken_1.default.sign({ user: datatoken }, SECRET);
            const sqlupd2 = "update t_serviciosmasivos set tokenservicios = $1 where id = $2 ";
            yield database_1.pool.query(sqlupd2, [tokenservicios, id]);
            const data = {
                success: true,
                resp: {
                    message: "Servicios actualizado con éxito"
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Actualizando Servicios masivos ' + e);
        }
    });
}
exports.updateSede = updateSede;
function updateEstatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { estatus } = req.body;
            const { id } = req.params;
            const sqlupd = "update t_serviciosmasivos set estatus = $1 where id = $2 ";
            yield database_1.pool.query(sqlupd, [estatus, id]);
            const data = {
                success: true,
                resp: {
                    message: "Estatus de Servicios actualizado con éxito"
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Actualizando Estatus de Servicios masivos ' + e);
        }
    });
}
exports.updateEstatus = updateEstatus;
