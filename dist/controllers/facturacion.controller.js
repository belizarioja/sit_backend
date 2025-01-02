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
exports.envioCorreo = exports.crearFactura = exports.getNumerointerno = exports.setFacturacion = void 0;
const moment_1 = __importDefault(require("moment"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const html_pdf_1 = __importDefault(require("html-pdf"));
const path_1 = __importDefault(require("path"));
const qrcode_1 = __importDefault(require("qrcode"));
const axios_1 = __importDefault(require("axios"));
// import shortUrl from 'node-url-shortener';
const database_1 = require("../database");
const USERMAIL = process.env.USERMAIL;
const PASSMAIL = process.env.PASSMAIL;
const SERVERFILE = process.env.SERVERFILE;
const FILEPDF = process.env.FILEPDF;
const SERVERIMG = process.env.SERVERIMG;
const IMGPDF = process.env.IMGPDF;
const HOSTSMTP = process.env.HOSTSMTP;
const AMBIENTE = process.env.AMBIENTE;
const URLFRN = process.env.URLFRN;
const URLPASARELADEPAGO = process.env.URLPASARELADEPAGO;
const APISMS = process.env.APISMS;
const TOKENAPISMS = process.env.TOKENAPISMS;
let DECIMALES = 2;
let EMAILBCC = '';
let URLPUBLICIDADEMAIL = '';
let ISPUBLICIDAD = '0';
let ERRORINT = '';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
process.env['OPENSSL_CONF'] = '/dev/null';
function setFacturacion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // try {
        const { id, rif, razonsocial, email, direccion, validarinterno } = req;
        const { rifcedulacliente, nombrecliente, telefonocliente, direccioncliente, idtipodocumento, trackingid, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, tasacambio, tipomoneda } = req.body;
        const { emailcliente, subtotal, total, exento, tasar, baser, impuestor, relacionado, idtipocedulacliente, cuerpofactura, sendmail, numerointerno, formasdepago, observacion, fechavence, serial } = req.body;
        const { tasaa, basea, impuestoa, direccionsucursal, sucursal, regimenanterior, botondepago } = req.body;
        // console.log(req)
        // console.log('baseigtf, impuestog')
        // console.log('baseigtf, impuestog')
        // console.log(baseigtf, impuestog)
        yield database_1.pool.query('BEGIN');
        const _tasacambio = tasacambio || 0;
        const _fechavence = fechavence || null;
        const _serial = serial || null;
        const _direccionsucursal = direccionsucursal || null;
        const _regimenanterior = regimenanterior || 0;
        const _botondepago = botondepago || 0;
        const _tipomoneda = tipomoneda || 1;
        const lotepiedepagina = yield obtenerLote(res, id);
        if (lotepiedepagina === '0') {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 12,
                    message: 'Mo tiene disponibilidad de ASIGNADOS!'
                }
            });
        }
        /* if(formasdepago.length === 0) {
            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 13,
                    message: 'Debe incluir al menos una forma de PAGO!'
                }
            });
        } */
        const piedepagina = 'Este documento se emite bajo la providencia administrativa Nro. SNAT/2014/0032 de fecha 31/07/2014.<br>Imprenta SMART INNOVACIONES TECNOLOGICAS, C.A. RIF J-50375790-6, Autorizada según Providencia Administrativa Nro. SENIAT/INTI/011 de fecha 10/11/2023.<br>' + lotepiedepagina;
        // console.log('rifcedulacliente')
        // console.log(rifcedulacliente)
        if (rifcedulacliente === undefined || rifcedulacliente.length === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de RIF CLIENTE no válido. Debe incluir esa propiedad!'
                }
            });
        }
        if (nombrecliente === undefined || nombrecliente.length === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de NOMBRE CLIENTE no válido. Debe incluir esa propiedad!'
                }
            });
        }
        if (direccioncliente === undefined || direccioncliente.length === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 21,
                    message: 'Valor de DIRECCION CLIENTE no válido. Debe incluir esa propiedad!'
                }
            });
        }
        if (telefonocliente === undefined || telefonocliente.length === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 22,
                    message: 'Valor de TELEFONO CLIENTE no válido. Debe incluir esa propiedad!'
                }
            });
        }
        if (Number(_tipomoneda) === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 24,
                    message: 'Valor de TIPO MONEDA no válido. Debe incluir esa propiedad y valores 1, 2 ó 3!'
                }
            });
        }
        if (Number(_tipomoneda) > 1 && Number(_tasacambio) === 0) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 23,
                    message: 'Valor de TASA CAMBIO no válido. Debe incluir esa propiedad MAYOR QUE CERO (0)!'
                }
            });
        }
        // console.log(Number(baseg) * Number(tasag) / 100, Number(impuestog))
        let totalimp = 0;
        let totalbase = 0;
        // console.log( (Number(baseg) * (Number(tasag) / 100)), Number(impuestog))
        // console.log( (Number(baseg) * (Number(tasag) / 100)).toFixed(2), Number(impuestog).toFixed(2))
        if (Number(baseg) > 0 && Number(tasag) > 0) {
            if ((Number(baseg) * (Number(tasag) / 100)).toFixed(2) !== Number(impuestog).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IVA ' + tasag + '% MAL CALCULADO!'
                    }
                });
            }
            else {
                totalimp += Number(impuestog);
                totalbase += Number(baseg);
            }
        }
        if (Number(baser) > 0 && Number(tasar) > 0) {
            if ((Number(baser) * (Number(tasar) / 100)).toFixed(2) !== Number(impuestor).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO REDUCIDO ' + tasar + '% MAL CALCULADO!'
                    }
                });
            }
            else {
                totalimp += Number(impuestor);
                totalbase += Number(baser);
            }
        }
        if (Number(basea) > 0 && Number(tasaa) > 0) {
            if ((Number(basea) * (Number(tasaa) / 100)).toFixed(2) !== Number(impuestoa).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO AL LUJO ' + tasar + '% MAL CALCULADO!'
                    }
                });
            }
            else {
                totalimp += Number(impuestoa);
                totalbase += Number(basea);
            }
        }
        if (Number(baseigtf) > 0 && Number(tasaigtf) > 0) {
            if ((Number(baseigtf) * (Number(tasaigtf) / 100)).toFixed(2) !== Number(impuestoigtf).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IGTF ' + tasaigtf + '% MAL CALCULADO!'
                    }
                });
            }
            else {
                totalimp += Number(impuestoigtf);
                // console.log(totalimp, Number(impuestoigtf))
                // totalbase += Number(baseigtf)
            }
        }
        if (Number(exento) > 0) {
            totalbase += Number(exento);
        }
        if (Number(subtotal) > 0) {
            // console.log(Number(totalbase), Number(subtotal))
            if (Number(totalbase).toFixed(2) !== Number(subtotal).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de SUBTOTAL MAL CALCULADO!'
                    }
                });
            }
            // console.log(Number(subtotal), Number(totalimp), Number(total))
            // console.log((Number(subtotal) + Number(totalimp)).toFixed(2), Number(total).toFixed(2))
            if ((Number(subtotal) + Number(totalimp)).toFixed(2) !== Number(total).toFixed(2)) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de TOTAL MAL CALCULADO!'
                    }
                });
            }
        }
        else {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 4,
                    message: 'Debe agregar valor de SUBTOTAL!'
                }
            });
        }
        // console.log('idtipodocumento, relacionado')
        // console.log(idtipodocumento, relacionado)
        if ((idtipodocumento === 2 || idtipodocumento === 3) && !relacionado) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 5,
                    message: 'Campo RELACIONADO es requerido!'
                }
            });
        }
        let numeroafectado = '';
        let fechaafectado = '';
        let idtipoafectado = '';
        const observacionBD = observacion || '';
        if (idtipodocumento === 2 || idtipodocumento === 3) {
            // console.log('Regimen anterior: ', _regimenanterior)
            if (Number(_regimenanterior) !== 1) {
                const sqlrel = " SELECT * FROM t_registros ";
                const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
                // console.log(sqlupd + whereupd)
                const resprel = yield database_1.pool.query(sqlrel + whererel, [id, relacionado]);
                if (resprel.rows.length === 0) {
                    yield database_1.pool.query('ROLLBACK');
                    return res.status(202).json({
                        success: false,
                        data: null,
                        error: {
                            code: 11,
                            message: 'NUMERO DOCUMENTO no corresponde al cliente emisor!'
                        }
                    });
                }
                else {
                    // console.log('resprel.rows[0]')
                    // console.log(resprel.rows[0])
                    numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : relacionado;
                    fechaafectado = resprel.rows[0].fecha;
                    idtipoafectado = resprel.rows[0].idtipodocumento;
                }
            }
            else {
                // console.log('OBSERVACION Regimen anterior: ', observacionBD)
                if (observacionBD.length === 0) {
                    yield database_1.pool.query('ROLLBACK');
                    return res.status(202).json({
                        success: false,
                        data: null,
                        error: {
                            code: 20,
                            message: 'DEBE INCLUIR OBSERVACION PARA REGIMEN ANTERIOR!'
                        }
                    });
                }
            }
        }
        if (cuerpofactura.length === 0 && idtipodocumento !== 2 && idtipodocumento !== 3) {
            yield database_1.pool.query('ROLLBACK');
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 10,
                    message: 'Cuerpo de DETALLE FACTURA es requerido!'
                }
            });
        }
        const sql = " UPDATE t_serviciosdoc ";
        let set = " SET identificador = CASE WHEN corelativo = 99999999 THEN identificador + 1 ELSE identificador END, ";
        set += " corelativo = CASE WHEN corelativo = 99999999 THEN 1 ELSE corelativo + 1 END ";
        const where = " where idserviciosmasivo = $1 RETURNING idserviciosmasivo, identificador, corelativo ";
        // console.log(sql + set + where);
        const resp = yield database_1.pool.query(sql + set + where, [id]);
        let identificador = Number(resp.rows[0].identificador);
        let corelativo = Number(resp.rows[0].corelativo);
        // AQUI VALIDAR NU8MERO INTERNO
        if (validarinterno > 0) {
            // console.log('Aqui función para validar numero interno 1:', numerointerno)
            if ((numerointerno === null || numerointerno === void 0 ? void 0 : numerointerno.length) === 0) {
                // console.log('Aqui función para validar numero interno 2:', numerointerno)
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 7,
                        message: 'Falta valor del NÚMERO INTERNO!'
                    }
                });
            }
            else {
                const sqlinterno = "SELECT * FROM t_registros";
                const whareinterno = " WHERE numerointerno = $1 AND idtipodocumento = $2 AND idserviciosmasivo = $3  ";
                const respinterno = yield database_1.pool.query(sqlinterno + whareinterno, [numerointerno, idtipodocumento, id]);
                if (respinterno.rows.length > 0) {
                    yield database_1.pool.query('ROLLBACK');
                    return res.status(202).json({
                        success: false,
                        data: null,
                        error: {
                            code: 8,
                            message: 'NÚMERO INTERNO para este TIPO DE DOCUMENTO, ya existe!'
                        }
                    });
                }
                else {
                    // console.log('Aqui función para validar numero interno 3 :', numerointerno)                  
                    const respinterno2 = yield obtenerNumInterno(idtipodocumento, id);
                    if (Number(respinterno2) > 0 && (Number(respinterno2) + 1 !== Number(numerointerno))) {
                        yield database_1.pool.query('ROLLBACK');
                        return res.status(202).json({
                            success: false,
                            data: null,
                            error: {
                                code: 9,
                                message: 'NÚMERO INTERNO no corresponde numeración esperada! Actual:' + respinterno2
                            }
                        });
                    }
                }
            }
            // console.log('Aqui función para validar numero interno :', numerointerno)
        }
        // AJUSTE PARA MULTIMONEDA Y PASARLOS A BOLIVARES
        DECIMALES = _tipomoneda > 1 ? 4 : 2;
        // console.log(tipomoneda, subtotal, total, exento, baser, impuestor, baseg, impuestog, baseigtf, impuestoigtf)
        const _subtotal = _tipomoneda > 1 ? (subtotal * tasacambio).toFixed(DECIMALES) : subtotal;
        const _total = _tipomoneda > 1 ? (total * tasacambio).toFixed(DECIMALES) : total;
        const _exento = _tipomoneda > 1 ? (exento * tasacambio).toFixed(DECIMALES) : exento;
        const _baser = _tipomoneda > 1 ? (baser * tasacambio).toFixed(DECIMALES) : baser;
        const _impuestor = _tipomoneda > 1 ? (impuestor * tasacambio).toFixed(DECIMALES) : impuestor;
        const _baseg = _tipomoneda > 1 ? (baseg * tasacambio).toFixed(DECIMALES) : baseg;
        const _impuestog = _tipomoneda > 1 ? (impuestog * tasacambio).toFixed(DECIMALES) : impuestog;
        const _baseigtf = _tipomoneda > 1 ? (baseigtf * tasacambio).toFixed(DECIMALES) : baseigtf;
        const _impuestoigtf = _tipomoneda > 1 ? (impuestoigtf * tasacambio).toFixed(DECIMALES) : impuestoigtf;
        // const _baseigtf = baseigtf.toFixed(2)
        // const _impuestoigtf = impuestoigtf.toFixed(2)
        // console.log(_subtotal, _total, _exento, _baser, _impuestor, _baseg, _impuestog, _baseigtf, _impuestoigtf)
        // AJUSTE PARA MULTIMONEDA Y PASARLOS A BOLIVARES
        const numerocompleto = identificador.toString().padStart(2, '0') + '-' + corelativo.toString().padStart(8, '0');
        const relacionadoBD = relacionado || '';
        const fechaenvio = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        const insert = 'INSERT INTO t_registros (numerodocumento, idtipodocumento, idserviciosmasivo, trackingid, cedulacliente, nombrecliente, subtotal, total, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, fecha, exento, tasar, baser, impuestor, estatus, relacionado, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, secuencial, tasacambio, observacion, tipomoneda, fechavence, serial, direccionsucursal, regimenanterior, botondepago ) ';
        const values = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 1, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36) RETURNING id ';
        const respReg = yield database_1.pool.query(insert + values, [numerocompleto, idtipodocumento, id, trackingid, rifcedulacliente, nombrecliente, _subtotal, _total, tasag, _baseg, _impuestog, tasaigtf, _baseigtf, _impuestoigtf, fechaenvio, _exento, tasar, _baser, _impuestor, relacionadoBD, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, Number(numerointerno), _tasacambio, observacionBD, _tipomoneda, _fechavence, _serial, _direccionsucursal, _regimenanterior, _botondepago]);
        // console.log('DECIMALES, _tipomoneda')
        // console.log(DECIMALES, _tipomoneda)
        const idRegistro = respReg.rows[0].id;
        for (const ind in cuerpofactura) {
            const item = cuerpofactura[ind];
            // console.log(item)
            // console.log(Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100, Math.round(item.monto * 100) / 100)
            if (Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100 !== Math.round(item.monto * 100) / 100) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor del MONTO DE UN REGISTRO, MAL CALCULADO!'
                    }
                });
            }
            const _monto = _tipomoneda > 1 ? (item.monto * tasacambio).toFixed(DECIMALES) : item.monto;
            const _descuento = _tipomoneda > 1 ? (item.descuento * tasacambio).toFixed(DECIMALES) : item.descuento;
            const _precio = _tipomoneda > 1 ? (item.precio * tasacambio).toFixed(DECIMALES) : item.precio;
            // console.log(_monto, _descuento, _precio)
            const insertDet = 'INSERT INTO t_registro_detalles (idregistro, codigo, descripcion, precio, cantidad, tasa, monto, exento, comentario, descuento, intipounidad ) ';
            const valuesDet = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ';
            yield database_1.pool.query(insertDet + valuesDet, [idRegistro, item.codigo, item.descripcion, _precio, item.cantidad, item.tasa, _monto, item.exento, item.comentario, _descuento, item.intipounidad]);
            // console.log(insertDet + valuesDet)
        }
        // console.log('formasdepago')
        // console.log(formasdepago)
        for (const ind in formasdepago) {
            const item2 = formasdepago[ind];
            // console.log((Number(item.precio) * Number(item.cantidad) + Number(item.impuesto)).toFixed(2), Number(item.monto).toFixed(2))
            if (item2.forma.length === 0) {
                yield database_1.pool.query('ROLLBACK');
                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 14,
                        message: 'Informacion de forma de pago NO VALIDA!'
                    }
                });
            }
            const insertForma = 'INSERT INTO t_formasdepago (idregistro, forma, valor ) ';
            const valuesForma = ' VALUES ($1, $2, $3) ';
            yield database_1.pool.query(insertForma + valuesForma, [idRegistro, item2.forma, item2.valor]);
            // console.log(insertDet + valuesDet)
        }
        yield database_1.pool.query('COMMIT');
        if (cuerpofactura.length > 0 || (idtipodocumento === 2 || idtipodocumento === 3)) {
            // console.log('va a Crear pdf idtipodocumento:  ', idtipodocumento)
            yield enviarCrearFactura(res, rif, numerocompleto, sendmail);
            // await crearFactura(res, rif, razonsocial, direccion, numerocompleto, nombrecliente, cuerpofactura, emailcliente, rifcedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, id, email, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, sendmail, _tasacambio, observacionBD, 1, _tipomoneda)
        }
        else {
            console.log('Sin Factura pdf correo');
        }
        // J-12345678-9/2024-08/J-12345678-900-00000265
        const data = {
            success: true,
            error: null,
            data: {
                numerodocumento: numerocompleto,
                piedepagina: piedepagina,
                identificador: identificador.toString().padStart(2, '0'),
                corelativo: corelativo.toString().padStart(8, '0'),
                datatime: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss'),
                fecha: (0, moment_1.default)().format('YYYYMMDD'),
                hora: (0, moment_1.default)().format('HH:mm:ss'),
                urlpdf: SERVERFILE + rif + '/' + (0, moment_1.default)().format('YYYY-MM') + '/' + rif + numerocompleto
            }
        };
        return res.status(200).json(data);
        /* }
        catch (e) {
            return res.status(400).send('Error Creando correlativo o cuerpo de factura ' + e);
        } */
    });
}
exports.setFacturacion = setFacturacion;
function obtenerNumInterno(idtipodocumento, idserviciosmasivo) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = "SELECT MAX(secuencial) FROM t_registros";
        const where = " WHERE idtipodocumento = " + idtipodocumento + " AND idserviciosmasivo = " + idserviciosmasivo;
        // console.log(sqlinterno2 + whareinterno2)
        const resp = yield database_1.pool.query(sql + where);
        return resp.rows[0].max;
    });
}
function getNumerointerno(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req;
            const { idtipodocumento } = req.body;
            const resp = yield obtenerNumInterno(idtipodocumento, id);
            const numeronext = Number(resp) + 1;
            const data = {
                success: true,
                error: null,
                data: {
                    numerointerno: numeronext.toString().padStart(8, '0')
                }
            };
            return res.status(200).json(data);
        }
        catch (e) {
            return res.status(400).send('Error Obteniendo numero Interno ' + e);
        }
    });
}
exports.getNumerointerno = getNumerointerno;
function enviarCrearFactura(res, rif, numerodocumento, sendmail) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('va a Consultar registros')
        // try {
        let sql = "select a.id, a.idserviciosmasivo, c.razonsocial, c.rif, c.email, c.direccion, c.telefono, a.numerodocumento, a.emailcliente,  a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, a.relacionado, a.impuestoigtf, a.baseigtf, a.fecha, ";
        sql += " a.trackingid, a.fecha, d.abrev, a.idtipocedulacliente, a.numerointerno, a.piedepagina, c.enviocorreo, a.tasacambio, a.observacion, a.estatus, a.tipomoneda, a.fechavence, a.serial, a.total, a.baseg, a.impuestog, a.baser, a.impuestor, a.exento, a.sucursal, a.direccionsucursal, a.regimenanterior, a.botondepago ";
        const from = " from t_registros a, t_tipodocumentos b, t_serviciosmasivos c , t_tipocedulacliente d ";
        const where = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id and a.idtipocedulacliente = d.id and a.numerodocumento = $1 and c.rif = $2";
        yield database_1.pool.query(sql + from + where, [numerodocumento, rif]).then((response) => __awaiter(this, void 0, void 0, function* () {
            // console.log(response)
            // console.log(response.rows[0])
            const idregistro = response.rows[0].id;
            const idserviciosmasivo = response.rows[0].idserviciosmasivo;
            const razonsocial = response.rows[0].razonsocial;
            const emailemisor = response.rows[0].email;
            const emailcliente = response.rows[0].emailcliente;
            const nombrecliente = response.rows[0].nombrecliente;
            const direccion = response.rows[0].direccion;
            const cedulacliente = response.rows[0].cedulacliente;
            const idtipocedulacliente = response.rows[0].idtipocedulacliente;
            const idtipodocumento = response.rows[0].idtipodocumento;
            const telefonocliente = response.rows[0].telefonocliente || '';
            const direccioncliente = response.rows[0].direccioncliente || '';
            const impuestoigtf = response.rows[0].impuestoigtf;
            const baseigtf = response.rows[0].baseigtf;
            const numerointerno = response.rows[0].numerointerno;
            const piedepagina = response.rows[0].piedepagina;
            const tasacambio = response.rows[0].tasacambio;
            const observacion = response.rows[0].observacion || '';
            const sucursal = response.rows[0].sucursal || '';
            const direccionsucursal = response.rows[0].direccionsucursal || '';
            const serial = response.rows[0].serial || '';
            const total = response.rows[0].total || 0;
            const baseg = response.rows[0].baseg || 0;
            const impuestog = response.rows[0].impuestog || 0;
            const baser = response.rows[0].baser || 0;
            const impuestor = response.rows[0].impuestor || 0;
            const exento = response.rows[0].exento || 0;
            const regimenanterior = response.rows[0].regimenanterior || 0;
            const botondepago = response.rows[0].botondepago || 0;
            const fechavence = response.rows[0].fechavence ? (0, moment_1.default)(response.rows[0].fechavence).format('DD/MM/YYYY') : '';
            const estatus = response.rows[0].estatus;
            const tipomoneda = response.rows[0].tipomoneda;
            // const sendmail = 1 
            const fechaenvio = (0, moment_1.default)(response.rows[0].fecha).format('YYYY-MM-DD hh:mm:ss a');
            // console.log('respdoc.rows[0].fecha, fechaenvio')
            // console.log(response.rows[0].fecha, fechaenvio)
            let numeroafectado = response.rows[0].relacionado.length > 0 ? response.rows[0].relacionado : '';
            let fechaafectado = '';
            let idtipoafectado = '';
            if (idtipodocumento === '2' || idtipodocumento === '3') {
                const sqlrel = " SELECT * FROM t_registros ";
                const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
                // console.log(sqlupd + whereupd)
                const resprel = yield database_1.pool.query(sqlrel + whererel, [idserviciosmasivo, response.rows[0].relacionado]);
                if (resprel.rows.length > 0) {
                    numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : numeroafectado;
                    fechaafectado = resprel.rows[0].fecha;
                    idtipoafectado = resprel.rows[0].idtipodocumento;
                }
            }
            const sqldet = "select id, codigo, descripcion, precio, cantidad, tasa, monto, exento, descuento, comentario, intipounidad ";
            const fromdet = " from t_registro_detalles ";
            const wheredet = " where idregistro = " + idregistro;
            // console.log(sql + from + where)
            const respdet = yield database_1.pool.query(sqldet + fromdet + wheredet);
            // console.log(respdet.rows)
            const cuerpofactura = respdet.rows;
            const sqlformas = "select forma, valor ";
            const fromformas = " from t_formasdepago ";
            const whereformas = " where idregistro = " + idregistro;
            // console.log(sql + from + where)
            const respformas = yield database_1.pool.query(sqlformas + fromformas + whereformas);
            // console.log(respdet.rows)
            const formasdepago = respformas.rows;
            // console.log('va a Crear PDF')
            yield crearFactura(res, rif, razonsocial, direccion, numerodocumento, nombrecliente, cuerpofactura, emailcliente, cedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, idserviciosmasivo, emailemisor, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, sendmail, tasacambio, observacion, estatus, tipomoneda, fechavence, serial, total, baseg, impuestog, baser, impuestor, exento, sucursal, direccionsucursal, regimenanterior, botondepago);
        }));
        /* }catch (e) {
            console.log('Error enviarCrearFactura >>>> ' + e)
            return res.status(400).send('Error enviarCrearFactura >>>> ' + e);
        } */
    });
}
function crearFactura(res, _rif, _razonsocial, _direccion, _pnumero, _nombrecliente, productos, _emailcliente, _rifcliente, _idtipocedula, _telefonocliente, _direccioncliente, _numerointerno, _id, _emailemisor, _idtipodoc, _numeroafectado, _impuestoigtf, _fechaafectado, _idtipoafectado, _piedepagina, _baseigtf, _fechaenvio, _formasdepago, _sendmail, _tasacambio, _observacion, _estatus, _tipomoneda, _fechavence, _serial, __total, __baseg, __impuestog, __baser, __impuestor, __exento, _sucursal, _direccionsucursal, _regimenanterior, _botondepago) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sqlsede = "SELECT a.email, a.telefono, a.sitioweb, a.banner, a.plantillapdf, b.colorfondo1, b.colorfuente1, b.colorfondo2, b.colorfuente2, a.textoemail, b.banner, a.emailbcc, a.enviocorreo, a.publicidad, c.codigocomercial, a.enviosms, a.botondepago  ";
            const fromsede = " FROM t_serviciosmasivos a ";
            let leftjoin = " left join t_plantillacorreos b ON a.banner = b.banner and a.id = b.idserviciosmasivo  ";
            leftjoin += " left join t_codigoscomercial c ON a.idcodigocomercial = c.id ";
            const wheresede = " WHERE a.id = $1";
            const respsede = yield database_1.pool.query(sqlsede + fromsede + leftjoin + wheresede, [_id]);
            const enviocorreo = respsede.rows[0].enviocorreo || 0;
            const botondepago = respsede.rows[0].botondepago || 0;
            const emailbcc = respsede.rows[0].emailbcc || '';
            const sitioweb = respsede.rows[0].sitioweb;
            const colorfondo1 = respsede.rows[0].colorfondo1 || '#d4e5ff';
            const colorfuente1 = respsede.rows[0].colorfuente1 || '#000000';
            const colorfondo2 = respsede.rows[0].colorfondo2 || '#edfbf4';
            const colorfuente2 = respsede.rows[0].colorfuente2 || '#666666';
            const textoemail = respsede.rows[0].textoemail || '0';
            const enviosms = respsede.rows[0].enviosms || '0';
            const banner = respsede.rows[0].banner || '1';
            const _telefono = respsede.rows[0].telefono;
            const codigoactividad = respsede.rows[0].codigocomercial;
            const plantillapdf = respsede.rows[0].plantillapdf;
            const prefijo = Number(_tipomoneda) === 1 ? 'Bs.' : Number(_tipomoneda) === 2 ? '$' : '€';
            // console.log('_tipomoneda, DECIMALES')
            // console.log(_tipomoneda, DECIMALES)
            ISPUBLICIDAD = respsede.rows[0].publicidad || '0';
            let URLPUBLICIDAD = '';
            let publicidad = '';
            let csstabla = 'sinpublicidad';
            // console.log('ISPUBLICIDAD')
            // console.log(ISPUBLICIDAD)
            if (ISPUBLICIDAD === '1') {
                csstabla = 'conpublicidad';
                URLPUBLICIDAD = IMGPDF + _rif + "_publi01.png";
                URLPUBLICIDADEMAIL = SERVERIMG + _rif + "_publi01.png";
                publicidad = `<tr>
                    <td colspan="2" class="text-center" style="padding-top:5px;">
                        <img class="img-fluid" src="${URLPUBLICIDAD}" alt="Publicidad" width="100%" height="80" >
                    </td>
                </tr>`;
            }
            // const ubicacionPlantilla = require.resolve("../plantillas/factura.html");
            const ubicacionPlantilla = require.resolve("../plantillas/" + _rif + ".html");
            let contenidoHtml = fs_1.default.readFileSync(ubicacionPlantilla, 'utf8');
            contenidoHtml = contenidoHtml.replace("{{csstabla}}", csstabla);
            const annioenvio = (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("YYYY");
            const mesenvio = (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("MM");
            const diaenvio = (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD");
            const infoQR = URLFRN + '/#/viewqrinvoice/' + _rif + 'SM' + _pnumero;
            yield crearCodeQR(infoQR, _rif, annioenvio, mesenvio, _pnumero);
            let trsucursal = `<div class="tarjetaSucursal">
            <div style="font-size: 7px;">Sucursal: ${_sucursal}</div>
            <div style="font-size: 7px;">${_direccionsucursal}</div>
        </div>`;
            if (_sucursal.length > 0) {
                contenidoHtml = contenidoHtml.replace("{{trsucursal}}", trsucursal);
            }
            else {
                contenidoHtml = contenidoHtml.replace("{{trsucursal}}", '');
            }
            const formateador = new Intl.NumberFormat("eu");
            // Generar el HTML de la tabla
            let tabla = "";
            let titulotabla = "";
            let subtotal = 0;
            let subtotalbs = 0;
            let totalbs = 0;
            let total = 0;
            let _exento = 0;
            let _exentobs = 0;
            let _impuestog = 0;
            let _baseg = 0;
            let _impuestor = 0;
            let _baser = 0;
            let _impuestoa = 0;
            let _basea = 0;
            let _impuestogbs = 0;
            let _basegbs = 0;
            let _impuestorbs = 0;
            let _baserbs = 0;
            let _impuestoabs = 0;
            let _baseabs = 0;
            const _sixe1 = Number(_idtipodoc) === 5 ? 7 : 7;
            const _sixe2 = Number(_idtipodoc) === 5 ? 82 : 38;
            const _sixe3 = Number(_idtipodoc) === 5 ? 10 : 10;
            const tdobservacion = _tipomoneda > 1 ? `<td style="width: 40%;vertical-align: baseline;">` : `<td style="width: 70%;vertical-align: baseline;">`;
            const tdtotales = _tipomoneda > 1 ? `<td style="width: 60%;">` : `<td style="width: 30%;">`;
            if (Number(plantillapdf) === 3) {
                contenidoHtml = contenidoHtml.replace("{{tdobservacion}}", tdobservacion);
                contenidoHtml = contenidoHtml.replace("{{tdtotales}}", tdtotales);
            }
            titulotabla += `<tr class="fondoGris">
                        <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: ${_sixe1}%;border-bottom: 2px solid #65778D;">Cod.</th>
                        <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: ${_sixe2}%;border-bottom: 2px solid #65778D;">Descripción</th>
                        <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: ${_sixe3}%;border-bottom: 2px solid #65778D;">Cantidad</th>`;
            if (Number(_idtipodoc) !== 5) {
                titulotabla += `<th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: 12%;border-bottom: 2px solid #65778D;">P. Unit.</th>
                    <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: 8%;border-bottom: 2px solid #65778D;">% IVA</th>
                    <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: 12%;border-bottom: 2px solid #65778D;">Monto Desc.</th>
                    <th class="text-center" style="padding: 3px; font-weight: 700;font-size: 7px;width: 10%;border-bottom: 2px solid #65778D;">Total</th>`;
            }
            titulotabla += `</tr>`;
            let j = 0;
            for (const producto of productos) {
                j = Number(j) + 1;
                const _monto = _tipomoneda > 1 ? (producto.monto / _tasacambio).toFixed(DECIMALES) : producto.monto;
                const _descuento = _tipomoneda > 1 ? (producto.descuento / _tasacambio).toFixed(DECIMALES) : producto.descuento;
                const _precio = _tipomoneda > 1 ? (producto.precio / _tasacambio).toFixed(DECIMALES) : producto.precio;
                // Aumentar el total
                const totalProducto = (producto.cantidad * _precio) - _descuento;
                // subtotalbs += totalProducto;
                // descuento += producto.descuento
                if (producto.exento === true || producto.exento === 'true') {
                    _exento += totalProducto;
                }
                else {
                    if (Number(producto.tasa) === 16) {
                        _impuestog += totalProducto * producto.tasa / 100;
                        _baseg += totalProducto;
                    }
                    if (Number(producto.tasa) === 8) {
                        _impuestor += totalProducto * producto.tasa / 100;
                        _baser += totalProducto;
                    }
                    if (Number(producto.tasa) === 31) {
                        _impuestoa += totalProducto * producto.tasa / 100;
                        _basea += totalProducto;
                    }
                    // baseiva += totalProducto;
                }
                // console.log('_monto, _precio, totalProducto, _baseg, _impuestog')
                // console.log(_monto, _precio, totalProducto, _baseg, _impuestog)
                let productoitem = `<table style="width:100%;"><tr style="height: 12px;"><td style="vertical-align: baseline;">${producto.descripcion}</td></tr></table>`;
                if (producto.comentario.length > 0) {
                    const arreglocom1 = producto.comentario.split('//');
                    // console.log('arreglocom1.length:', arreglocom1.length)
                    if (arreglocom1.length > 1) {
                        productoitem += `<table style="width:100%;">`;
                        for (let j = 0; j < arreglocom1.length - 1; j++) {
                            const ladoizq = arreglocom1[j].split('|')[0];
                            // console.log(ladoizq + ' >>>>>> ' + ladoder)
                            productoitem += `<tr ><td class="ladoizq">${ladoizq}</td>`;
                            if (arreglocom1[j].split('|').length > 1) {
                                const ladoder = arreglocom1[j].split('|')[1];
                                productoitem += `<td class="ladoder">${ladoder}</td>`;
                            }
                            productoitem += `</tr>`;
                        }
                        productoitem += `</table>`;
                    }
                    else {
                        productoitem += `<br><span>${producto.comentario}</span>`;
                    }
                    // console.log(ladoizq + ' >>>>>> ' + ladoder)
                }
                // console.log(productoitem)
                // Y concatenar los productos
                // const color = j % 2 === 0 ? '#ffffff' : '#ff0000'
                // const fondocolor = 'background: #ffffff  !important;'
                const fondocolor = '';
                let tdunidaditem = '';
                if (producto.intipounidad > 0) {
                    tdunidaditem = producto.intipounidad === '1' ? 'Unidad(es)' : producto.intipounidad === '2' ? 'Kilo(s)' : producto.intipounidad === '3' ? 'Litro(s)' : producto.intipounidad === '4' ? 'Metro(s)' : 'Caja(s)';
                }
                // console.log('PRECIO UNIT: ', completarDecimales(Number(_precio), DECIMALES))
                // console.log('TOTAL: ', completarDecimales(Number(_monto), DECIMALES))
                tabla += `<tr style="height: 10px; ${fondocolor}">
                <td style="vertical-align: baseline;font-size: 7px;padding: 0 2px;">${producto.codigo}</td>
                <td style="vertical-align: baseline;font-size: 7px;border-left: 1px dashed;padding: 0 2px;">${productoitem}</td>
                <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 0 2px;font-size: 7px;">${producto.cantidad} ${tdunidaditem}</td>`;
                if (Number(_idtipodoc) !== 5) {
                    tabla += `
                    <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 0 2px;font-size: 7px;">${completarDecimales(Number(_precio), DECIMALES)}</td>
                    <td class="text-center" style="vertical-align: baseline;border-left: 1px dashed;padding: 0 2px;font-size: 7px;">${producto.tasa}%</td>
                    <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 0 2px;font-size: 7px;">${completarDecimales(Number(_descuento), DECIMALES)}</td>
                    <td class="text-right" style="vertical-align: baseline;border-left: 1px dashed;padding: 0 2px;font-size: 7px;">${completarDecimales(Number(_monto), DECIMALES)}</td>`;
                }
                tabla += `</tr>`;
            }
            const tipodoc = Number(_idtipodoc) === 1 ? 'Factura' : Number(_idtipodoc) === 2 ? 'Nota de débito' : Number(_idtipodoc) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho';
            // COLETILLA
            const coletilla1 = "<b>En caso que la " + tipodoc + " genere pago con Divisas, la misma estará sujeta al cobro adicional del 3% de Impuesto Grandes Transacciones Financieras</b> de conformidad a lo establecido en la Providencia Administrativa SNAT/2022/000013, publicada en Gaceta Oficial 42.339 de fecha 17/03/2022.";
            const coletilla2 = " El equivalente en Bs., <b>A TASA DE CAMBIO OFICIAL BCV A Bs./USD DE " + _tasacambio + " </b>del día " + (0, moment_1.default)().format("DD/MM/YYYY") + ", según lo establecido en la Gaceta Oficial Nro. 6405 del convenio cambiario Nro. 1 de fecha 07/09/2018, expresándose en Bolívares, para dar cumplimiento a articulo Nro. 25 de la Ley de Impuesto al Valor Agregado y el articulo Nro. 38 de su respectivo reglamento.";
            let coletilla = coletilla1 + coletilla2;
            tabla += `<tr style="height: auto;">
            <td class="borderbottom" style="font-size: 7px;line-height: 1;">&nbsp;</td>
            <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>
            <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>`;
            if (Number(_idtipodoc) !== 5) {
                tabla += `
                <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>
                <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>
                <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>
                <td class="borderbottom" style="border-left: 1px dashed;font-size: 7px;line-height: 1;">&nbsp;</td>`;
            }
            tabla += `</tr>`;
            if (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) {
                _basegbs = __baseg;
                _impuestogbs = __impuestog;
                _baserbs = __baser;
                _impuestorbs = __impuestor;
                // _baseabs = __basea
                // _impuestoabs = __impuestoa
                _exentobs = __exento;
                if (_tipomoneda > 1) {
                    _impuestog = _impuestogbs / Number(_tasacambio);
                    _baseg = _basegbs / Number(_tasacambio);
                    _impuestor = _impuestorbs / Number(_tasacambio);
                    _baser = _baserbs / Number(_tasacambio);
                    _impuestoa = _impuestoabs / Number(_tasacambio);
                    _basea = _baseabs / Number(_tasacambio);
                    _exento = _exentobs / Number(_tasacambio);
                }
            }
            else {
                if (_tipomoneda > 1) {
                    _impuestogbs = _impuestog * Number(_tasacambio);
                    _basegbs = _baseg * Number(_tasacambio);
                    _impuestorbs = _impuestor * Number(_tasacambio);
                    _baserbs = _baser * Number(_tasacambio);
                    _impuestoabs = _impuestoa * Number(_tasacambio);
                    _baseabs = _basea * Number(_tasacambio);
                    _exentobs = _exento * Number(_tasacambio);
                }
            }
            // console.log('_impuestog', _impuestog)
            // console.log('_impuestogbs', _impuestogbs)
            // IMP GENERAL 16%
            let trImpuestogdivisa = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 16% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_basegbs), 2)}</td>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 16% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baseg), DECIMALES)}</td>
        </tr>
        <tr>
            <td class="text-right" style="font-size: 7px;">IVA 16% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestogbs), 2)}</td>
            <td class="text-right" style="font-size: 7px;">IVA 16% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestog), DECIMALES)}</td>
        </tr>`;
            let trImpuestogbs = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 16% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baseg), DECIMALES)}</td>
        </tr>
        <tr>
            <td class="text-right" style="font-size: 7px;">IVA 16% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestog), DECIMALES)}</td>
        </tr>`;
            // IMP REDUCIDO 8%
            let trImpuestordivisa = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 8% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baserbs), 2)}</td>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 8% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baser), DECIMALES)}</td>
        </tr>
        <tr>
            <td class="text-right" style="font-size: 7px;">IVA 8% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestorbs), 2)}</td>
            <td class=" text-right" style="font-size: 7px;">IVA 8% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestor), DECIMALES)}</td>
        </tr>`;
            let trImpuestorbs = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 8% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baser), DECIMALES)}</td>
        </tr>
        <tr>
            <td class=" text-right" style="font-size: 7px;">IVA 8% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestor), DECIMALES)}</td>
        </tr>`;
            // IMP AL LUJO 31%
            let trImpuestoadivisa = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 31% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_baseabs), 2)}</td>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 31% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_basea), DECIMALES)}</td>
        </tr>
        <tr>
            <td class="text-right" style="font-size: 7px;">IVA 31% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoabs), 2)}</td>
            <td class=" text-right" style="font-size: 7px;">IVA 31% ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoa), DECIMALES)}</td>
        </tr>`;
            let trImpuestoabs = `<tr>
            <td class="text-right" style="font-size: 7px;">Base imponible IVA 31% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_basea), 2)}</td>
        </tr>
        <tr>
            <td class=" text-right" style="font-size: 7px;">IVA 31% Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoa), DECIMALES)}</td>
        </tr>`;
            // EXENTO %
            let trExentoadivisa = `<tr>
            <td class="text-right" style="font-size: 7px;">Exento Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_exentobs), 2)}</td>
            <td class=" text-right" style="font-size: 7px;">Exento ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_exento), DECIMALES)}</td>
        </tr>`;
            let trExentobs = `<tr>
            <td class=" text-right" style="font-size: 7px;">Exento Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_exento), DECIMALES)}</td>
        </tr>`;
            let _impuestoigtfDiv = 0;
            let _baseigtfDiv = 0;
            // let _baseivausd = 0
            _baseigtfDiv = Number(_baseigtf) / Number(_tasacambio);
            _impuestoigtfDiv = Number(_impuestoigtf) / Number(_tasacambio);
            let trImpuestoigtfdivisa = `<tr>
            <td class=" text-right" style="font-size: 7px;">IGTF 3%(${prefijo}${completarDecimales(Number(_baseigtfDiv), 4)}) Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoigtf), 2)}</td>
            <td class=" text-right" style="font-size: 7px;">IGTF 3%(${prefijo}${completarDecimales(Number(_baseigtfDiv), 4)}) ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoigtfDiv), 4)}</td>
        </tr>`;
            let trImpuestoigtfbs = `<tr>
            <td class=" text-right" style="font-size: 7px;">IGTF 3%($${completarDecimales(Number(_baseigtfDiv), 4)}) Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(_impuestoigtf), DECIMALES)}</td>
        </tr>`;
            // const subtotalConDescuento = subtotal - descuento;        
            const subtotalConDescuento = subtotal;
            // console.log(subtotalConDescuento, impuestos, _impuestoigtf)
            const igtfTotal = _tipomoneda > 1 ? _impuestoigtfDiv : _impuestoigtf;
            // totalbs = subtotalConDescuento + _impuestogbs + _impuestorbs + _impuestoabs + Number(igtfTotal);
            // if(Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3 ) {
            // console.log('__total:', __total)
            totalbs = __total;
            // }
            // console.log(total)
            // const fecha = moment().format('DD/MM/YYYY hh:mm:ss a');
            // Remplazar el valor {{tablaProductos}} por el verdadero valor
            if ((Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) && productos.length === 0) {
                contenidoHtml = contenidoHtml.replace("{{titulotabla}}", '');
                contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", '');
            }
            else {
                contenidoHtml = contenidoHtml.replace("{{titulotabla}}", titulotabla);
                contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);
            }
            if (_tipomoneda > 1) {
                // subtotal = subtotalbs / Number(_tasacambio)
                total = totalbs / Number(_tasacambio);
            }
            // console.log('total:', total)
            // console.log('totalbs:', totalbs)
            let formasdepago = "";
            for (const forma of _formasdepago) {
                formasdepago += `${forma.forma} ${prefijo}: ${completarDecimales(Number(forma.valor), DECIMALES)}<br>`;
            }
            /* if(formasdepago.length > 0) {
                contenidoHtml = contenidoHtml.replace("{{tituloformasdepago}}", 'Formas de pago:');
            } else { */
            contenidoHtml = contenidoHtml.replace("{{tituloformasdepago}}", '');
            // }
            if (_observacion.length > 0) {
                contenidoHtml = contenidoHtml.replace("{{tituloobservacion}}", 'Observación:');
                const arregloobs = _observacion.split('//');
                // console.log('arregloobs.length:', arregloobs.length)
                let newobservacio = '';
                if (arregloobs.length > 1) {
                    newobservacio += `<table style="width:98%;">`;
                    for (let j = 0; j < arregloobs.length - 1; j++) {
                        const ladoizqobs = arregloobs[j].split('|')[0];
                        // console.log(ladoizqobs + ' >>>>>> ' + ladoderobs)
                        newobservacio += `<tr style="padding: 3px; font-weight: 700;font-size: 7px;"><td class="ladoizq">${ladoizqobs}</td>`;
                        if (arregloobs[j].split('|').length > 1) {
                            const ladoderobs = arregloobs[j].split('|')[1];
                            newobservacio += `<td class="ladoder">${ladoderobs}</td>`;
                        }
                        newobservacio += `</tr>`;
                    }
                    newobservacio += `</table>`;
                }
                else {
                    newobservacio += _observacion;
                }
                contenidoHtml = contenidoHtml.replace("{{observacion}}", newobservacio);
            }
            else {
                contenidoHtml = contenidoHtml.replace("{{tituloobservacion}}", '');
                contenidoHtml = contenidoHtml.replace("{{observacion}}", '');
            }
            const emailpdf = _emailcliente.split('|').join(', ');
            const tipocedula = Number(_idtipocedula) === 1 ? 'CI' : Number(_idtipocedula) === 2 ? 'Pasaporte' : 'RIF';
            const tipoafectado = Number(_idtipoafectado) === 1 ? 'Factura' : Number(_idtipoafectado) === 2 ? 'Nota de débito' : Number(_idtipoafectado) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho';
            const docafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ? 'Aplica a ' + tipoafectado + ' ' + _numeroafectado + ' ' : '';
            const numeroafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ? ' del ' + (0, moment_1.default)(_fechaafectado).format('DD/MM/YYYY hh:mm:ss a') : '';
            // console.log("AMBIENTE")
            // console.log(AMBIENTE)
            if (Number(_estatus) === 2) { // Si es anulado
                const ANULADO = FILEPDF + 'utils/anulado.gif';
                const fondoanulado = `<img src="${ANULADO}" style="position: absolute; left:0; top:0; z-index:-10; width: 100%; height: 100%; "/>`;
                contenidoHtml = contenidoHtml.replace("{{fondomarca}}", fondoanulado);
            }
            else {
                if (AMBIENTE === 'local' || AMBIENTE === 'test') { // Si NO es Produccion
                    const BORRADOR = FILEPDF + 'utils/borrador.png';
                    const fondoborrador = `<img src="${BORRADOR}" style="position: absolute; left:0; top:0; z-index:-10; width: 100%; height: 100%; "/>`;
                    contenidoHtml = contenidoHtml.replace("{{fondomarca}}", fondoborrador);
                }
                else {
                    contenidoHtml = contenidoHtml.replace("{{fondomarca}}", '');
                }
            }
            let afectado = '';
            // console.log('docafectado.length > 0, Number(_regimenanterior)')
            // console.log(docafectado.length > 0, Number(_regimenanterior))
            if (docafectado.length > 0 && Number(_regimenanterior) === 0) {
                afectado = `<tr>
                <td class="text-right afectado" style="font-size: 5px;font-weight: bolder;">${docafectado}</td>
                <td class="text-left afectado" style="font-size: 5px;font-weight: bolder;">&nbsp;${numeroafectado}</td>
            </tr>`;
            }
            let trfechavence = '';
            // console.log('_fechavence: ', _fechavence)
            if (_fechavence.length > 0) {
                trfechavence = ` <tr>
                <td class="text-right" style="font-size: 10px;font-weight: bolder;">Fecha de vencimiento</td>
                <td class="text-right" style="font-size: 9px;">${_fechavence}</td>
            </tr>`;
            }
            const folderPathQr = IMGPDF + 'codeqr/' + _rif + '/' + annioenvio + '-' + mesenvio + '/qrcode_' + _rif + _pnumero + '.png';
            contenidoHtml = contenidoHtml.replace("{{codigoactividad}}", codigoactividad);
            contenidoHtml = contenidoHtml.replace("{{codeqr}}", folderPathQr);
            contenidoHtml = contenidoHtml.replace("{{logo}}", IMGPDF + _rif + ".png");
            contenidoHtml = contenidoHtml.replace("{{direccion}}", _direccion);
            contenidoHtml = contenidoHtml.replace("{{razonsocial}}", _razonsocial);
            contenidoHtml = contenidoHtml.replace("{{rif}}", _rif);
            contenidoHtml = contenidoHtml.replace("{{telefono}}", _telefono);
            contenidoHtml = contenidoHtml.replace("{{numerodocumento}}", _pnumero);
            contenidoHtml = contenidoHtml.replace("{{serial}}", _serial);
            contenidoHtml = contenidoHtml.replace("{{numerointerno}}", _numerointerno);
            contenidoHtml = contenidoHtml.replace("{{tipodocumento}}", tipodoc);
            contenidoHtml = contenidoHtml.replace("{{afectado}}", afectado);
            contenidoHtml = contenidoHtml.replace("{{trfechavence}}", trfechavence);
            contenidoHtml = contenidoHtml.replace("{{tipocedula}}", tipocedula);
            contenidoHtml = contenidoHtml.replace("{{direccioncliente}}", _direccioncliente);
            contenidoHtml = contenidoHtml.replace("{{telefonocliente}}", _telefonocliente);
            contenidoHtml = contenidoHtml.replace("{{emailcliente}}", emailpdf);
            contenidoHtml = contenidoHtml.replace("{{cedulacliente}}", _rifcliente);
            // contenidoHtml = contenidoHtml.replace("{{monedabs}}", 'Moneda Bs.');
            contenidoHtml = contenidoHtml.replace("{{nombrecliente}}", _nombrecliente);
            contenidoHtml = contenidoHtml.replace("{{fechaasignacion}}", (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY"));
            contenidoHtml = contenidoHtml.replace("{{fecha}}", (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YYYY"));
            contenidoHtml = contenidoHtml.replace("{{hora}}", (0, moment_1.default)(_fechaenvio, "YYYY-MM-DD hh:mm:ss a").format("hh:mm:ss a"));
            // console.log(' _fechaenvio ', _fechaenvio)
            // console.log('Hora envio: ', moment(_fechaenvio, "YYYY-MM-DD hh:mm:ss a").format("hh:mm:ss a"))
            contenidoHtml = contenidoHtml.replace("{{piedepagina}}", _piedepagina);
            contenidoHtml = contenidoHtml.replace("{{formasdepago}}", formasdepago);
            // console.log(_impuestog, _impuestor, _impuestoa,_impuestoigtf )
            let trimpuestog = trImpuestogbs;
            let trimpuestor = trImpuestorbs;
            let trimpuestoa = trImpuestoabs;
            let trimpuestoigtf = trImpuestoigtfbs;
            let trExento = trExentobs;
            if (_tipomoneda > 1) {
                trimpuestog = trImpuestogdivisa;
                trimpuestor = trImpuestordivisa;
                trimpuestoa = trImpuestoadivisa;
                trimpuestoigtf = trImpuestoigtfdivisa;
                trExento = trExentoadivisa;
            }
            if (_impuestog === 0 || Number(_idtipodoc) === 5) {
                trimpuestog = '';
            }
            if (_impuestor === 0 || Number(_idtipodoc) === 5) {
                trimpuestor = '';
            }
            if (_impuestoa === 0 || Number(_idtipodoc) === 5) {
                trimpuestoa = '';
            }
            if (_impuestoigtf === 0 || Number(_idtipodoc) === 5) {
                trimpuestoigtf = '';
            }
            if (_exento === 0 || Number(_idtipodoc) === 5) {
                trExento = '';
            }
            contenidoHtml = contenidoHtml.replace("{{trexento}}", trExento);
            contenidoHtml = contenidoHtml.replace("{{trbaseg}}", trimpuestog);
            contenidoHtml = contenidoHtml.replace("{{trbaser}}", trimpuestor);
            contenidoHtml = contenidoHtml.replace("{{trbasea}}", trimpuestoa);
            contenidoHtml = contenidoHtml.replace("{{trbaseigtf}}", trimpuestoigtf);
            if (ISPUBLICIDAD) {
                contenidoHtml = contenidoHtml.replace("{{publicidad}}", publicidad);
            }
            else {
                contenidoHtml = contenidoHtml.replace("{{publicidad}}", '');
            }
            /* let trsubtotaldivisa = `<tr>
                <td class="text-right" style="font-size: 7px;">Subtotal Bs.:</td>
                <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(subtotalbs), 2)}</td>
                <td class="text-right" style="font-size: 7px;">Subtotal ${prefijo}:</td>
                <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(subtotal), DECIMALES)}</td>
            </tr>`
            let trsubtotalbs = `<tr>
                <td class=" text-right" style="font-size: 7px;">Subtotal Bs.:</td>
                <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(subtotal), DECIMALES)}</td>
            </tr>` */
            let trtotaldivisa = `<tr>
            <td class="text-right" style="font-size: 7px;">Total Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(totalbs), 2)}</td>
            <td class="text-right" style="font-size: 7px;">Total ${prefijo}:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(total), DECIMALES)}</td>
        </tr>`;
            let trtotalbs = `<tr>
            <td class=" text-right" style="font-size: 7px;">Total Bs.:</td>
            <td class="text-right" style="font-size: 7px;">${completarDecimales(Number(totalbs), DECIMALES)}</td>
        </tr>`;
            // let _trsubtotal = trsubtotalbs
            let _trtotal = trtotalbs;
            if (_tipomoneda > 1) {
                // _trsubtotal = trsubtotaldivisa
                _trtotal = trtotaldivisa;
            }
            if (Number(_idtipodoc) === 5) {
                // _trsubtotal = ''
                _trtotal = '';
            }
            // contenidoHtml = contenidoHtml.replace("{{trsubtotal}}", _trsubtotal);
            contenidoHtml = contenidoHtml.replace("{{trtotal}}", _trtotal);
            let trcoletilla = '';
            if (_tipomoneda > 1 && Number(_idtipodoc) !== 5) {
                trcoletilla = `<tr>
                <td colspan="2" class="text-center">
                    <p style="font-size: 6px;font-family:'Calibri'; text-align: center;">${coletilla}</p>
                </td>
            </tr>`;
            }
            contenidoHtml = contenidoHtml.replace("{{trcoletilla}}", trcoletilla);
            // NOTA DE ENTREGA GUIA DE DESPACHOS
            let creditofiscal = '';
            if (Number(_idtipodoc) === 4 || Number(_idtipodoc) === 5) {
                creditofiscal = `<tr>
                    <td colspan="2" class="text-left" style="padding-top:5px;">
                        <p style="font-size: 7px;font-family:'Calibri'">Sin derecho a crédito fiscal.</p>
                    </td>
                </tr>`;
            }
            contenidoHtml = contenidoHtml.replace("{{creditofiscal}}", creditofiscal);
            const pathPdf1 = "dist/controllers/temp/" + _rif + "/" + annioenvio + "-" + mesenvio + "/" + _rif + _pnumero + ".pdf";
            // firma digital
            // const icFirmaDocumentosInput = "/opt/icFirmaDocumentos/var/lib/icFirmaDocumentos/input"
            // const icFirmaDocumentosInput = __dirname
            // const icFirmaDocumentosInput = "C:/Users/personal/proyectos/quasar/sit"        
            // console.log(icFirmaDocumentosInput)
            // A3, A4, A5, Legal, Letter, Tabloid
            // const formatoPdf = Number(plantillapdf) === 4 ? 'A3' : 'Letter'
            const formatoPdf = 'Letter';
            // console.log(Number(plantillapdf), formatoPdf)
            html_pdf_1.default.create(contenidoHtml, { format: formatoPdf }).toFile(pathPdf1, (error) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    console.log("Error creando PDF: " + error);
                    return res.status(400).send('Error Interno Creando pdf :  ' + error);
                }
                else {
                    console.log("PDF creado correctamente");
                    //////////////
                    // FIRMAR PDF
                    //////////////
                    //////////////
                    // ENVIAR SMS
                    //////////////
                    const respSMS = yield validarTelefonoSMS(_telefonocliente);
                    // console.log('botondepago:', botondepago)
                    // console.log('_botondepago:', _botondepago)
                    const isboton = (botondepago === '1' && _botondepago === '1' && Number(_idtipodoc) === 1) ? 1 : 0;
                    // console.log('isboton:', isboton)
                    if (enviosms == 1 && Number(_idtipodoc) === 1 && respSMS) {
                        // console.log('va a Enviar SMS')
                        envioSms(res, _telefonocliente, APISMS, _numerointerno, _razonsocial, _rif, _id, _pnumero, annioenvio + "-" + mesenvio);
                    }
                    else {
                        console.log('Sin sms');
                    }
                    // console.log(enviocorreo, _sendmail, productos.length, _emailcliente, Number(_idtipodoc))
                    if (enviocorreo == 1 && _sendmail == 1 && (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3 || productos.length > 0) && (_emailcliente === null || _emailcliente === void 0 ? void 0 : _emailcliente.length) > 0) {
                        console.log('va a Enviar correo');
                        yield envioCorreo(res, _nombrecliente, _pnumero, _rif, _emailcliente, _telefono, colorfondo1, colorfuente1, colorfondo2, colorfuente2, sitioweb, textoemail, banner, _emailemisor, _numerointerno, tipodoc, annioenvio, mesenvio, diaenvio, emailbcc, _estatus, _rifcliente, isboton);
                    }
                    else {
                        console.log('Sin correo');
                    }
                }
            }));
        }
        catch (e) {
            return res.status(400).send('Error Externo Creando pdf :  ' + e);
        }
    });
}
exports.crearFactura = crearFactura;
function validarTelefonoSMS(telefonocliente) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('telefonocliente.length: ', telefonocliente.length)
        if (telefonocliente.length < 12) {
            // console.log('Error cantidad de digitos telefono')
            return false;
        }
        // console.log('telefonocliente.substring(0, 2): ', telefonocliente.substring(0, 2))
        if (telefonocliente.substring(0, 2) !== '58') {
            // console.log('Error código pais venezuela')
            return false;
        }
        // console.log('telefonocliente.substring(2, 5): ', telefonocliente.substring(2, 5))
        if (telefonocliente.substring(2, 5) !== '412' && telefonocliente.substring(2, 5) !== '414' && telefonocliente.substring(2, 5) !== '424' && telefonocliente.substring(2, 5) !== '416' && telefonocliente.substring(2, 5) !== '426') {
            // console.log('Error código operadora')
            return false;
        }
        return true;
    });
}
function crearCodeQR(informacion, rif, annio, mes, numerodocumento) {
    const folderPath = __dirname + '/temp/' + rif + '/codeqr/' + annio + '-' + mes; // Reemplaza con la ruta de tu carpeta
    fs_1.default.mkdirSync(folderPath, { recursive: true });
    qrcode_1.default.toFile(path_1.default.join(folderPath, 'qrcode_' + rif + numerodocumento + '.png'), informacion, (err) => {
        if (err)
            throw err;
    });
}
function completarDecimales(cadena, decimales) {
    const cadena2 = cadena.toFixed(decimales).toString().replace('.', ',');
    // const decimal = DECIMALES > 1 ? ',0000' : ',00'
    const arreglo = cadena2.split(',');
    let cadenafinal = '';
    if (decimales > 2) {
        cadenafinal = arreglo.length === 1 ? cadena2 + ',0000' : arreglo[1].length === 1 ? cadena2 + '000' : arreglo[1].length === 2 ? cadena2 + '00' : arreglo[1].length === 3 ? cadena2 + '0' : cadena2;
    }
    else {
        cadenafinal = arreglo.length === 1 ? cadena2 + ',00' : arreglo[1].length === 1 ? cadena2 + '0' : cadena2;
    }
    // console.log('cadenafinal', cadenafinal)
    const arreglo2 = cadena2.split(',');
    let str = arreglo2[0];
    // Aquí almacenaremos los resultados.
    let resultado = "";
    // Recorremos el string con for "str.length" veces.
    for (let i = 0; i < str.length; i++) {
        // Cada número, lo concatenamos a "resultado".
        resultado += str[i];
        // y luego de concatenar el número, verifico si el iterador es un múltiplo de 3.
        // ponemos "i < str.length - 1" para evitar que el punto se agregue al final del string.
        if ((str.length - i - 1) % 3 === 0 && i < str.length - 1) {
            resultado += ".";
        }
    }
    const cadenafinal2 = resultado + ',' + arreglo2[1];
    // console.log('cadenafinal2', cadenafinal2)
    return cadenafinal2;
}
function obtenerLote(res, id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sql = "SELECT a.id, a.inicia, a.termina, a.fechaproduccion, a.utilizado ";
            const from = " FROM t_tranzascorrelativo a, t_serviciosdoc b  ";
            const where = " WHERE a.idserviciosmasivo = b.idserviciosmasivo and b.corelativo + 1 >= a.inicia::numeric and b.corelativo < a.termina::numeric and a.estatus = 1 and a.idserviciosmasivo = $1";
            // console.log(id)
            // console.log(sql + from + where)
            const respReg = yield database_1.pool.query(sql + from + where, [id]);
            // console.log(respReg.rows)
            if (respReg.rows.length > 0) {
                const id = respReg.rows[0].id;
                const utilizado = Number(respReg.rows[0].utilizado) + 1;
                const update = "update t_tranzascorrelativo ";
                let set = " set utilizado = $1 ";
                let fechapiedepagina = (0, moment_1.default)().format('DD/MM/YYYY');
                // console.log(respReg.rows[0].fechaproduccion)
                if (!respReg.rows[0].fechaproduccion || respReg.rows[0].fechaproduccion == null || respReg.rows[0].fechaproduccion == 'null') {
                    // console.log('respReg.rows[0].fechaproduccion')
                    set += ", fechaproduccion = '" + (0, moment_1.default)().format("YYYY-MM-DD") + "'";
                }
                else {
                    fechapiedepagina = (0, moment_1.default)(respReg.rows[0].fechaproduccion).format('DD/MM/YYYY');
                }
                const whereupdate = " where id = $2";
                yield database_1.pool.query(update + set + whereupdate, [utilizado, id]);
                const numerolote = ' Desde Nro. de Control 00-' + respReg.rows[0].inicia.toString().padStart(8, '0') + ' Hasta Nro. 00-' + respReg.rows[0].termina.toString().padStart(8, '0') + ' de fecha ' + fechapiedepagina + '.';
                return numerolote;
            }
            else {
                return '0';
            }
        }
        catch (e) {
            console.log('Error Consultando asignacion :  ' + e);
            return '0';
        }
    });
}
function envioCorreo(res, _pnombre, _pnumero, _prif, _email, _telefono, _colorfondo1, _colorfuente1, _colorfondo2, _colorfuente2, _sitioweb, _texto, _banner, _emailemisor, _numerointerno, _tipodoc, _annioenvio, _mesenvio, _diaenvio, _emailbcc, _estatus, _rifcliente, _isboton) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: USERMAIL,
                    pass: PASSMAIL
                }
                /* host: HOSTSMTP,
                port: 25,
                secure: false */
            });
            // const ISPASARELAPAGO = null
            const numerocuerpo = _numerointerno.length > 0 ? _numerointerno : _pnumero;
            let htmlpublicidad = ``;
            let htmlpasarelapago = ``;
            // console.log('_isboton dentro del correo:', _isboton)
            if (_isboton === 1) {
                htmlpasarelapago = `<tr>
                <td style="padding: 0px 30px 20px; text-align: center;" colspan="3">          
                    <span style="font-weight: bolder; padding: 3px 10px;  background: #d6d6d6;border-radius: 10px;">
                        <a href="${URLPASARELADEPAGO}${_prif}SM${_pnumero}">Pagar</a>
                    </span>      
                </td>
            </tr>`;
            }
            if (ISPUBLICIDAD === '1') {
                htmlpublicidad = `<tr>
                <td style="padding: 0px 30px 20px; text-align: center;" colspan="3">               
                    <img src="${URLPUBLICIDADEMAIL}" style="max-width: 540px;">
                </td>
            </tr>`;
            }
            const texto_1 = _texto !== '0' ? `<tr>  
                            <td colspan="3">      
                                <div style="background: ${_colorfondo2}; margin-bottom: 30px; padding: 15px; font-size: 16px; color: ${_colorfuente2};">
                                <p style="text-align:left;">
                                    ${_texto}
                                </p>
                            </div> 
                            </td>
                        </tr>` : '';
            // console.log(_estatus)
            const mensaje = Number(_estatus) === 2 ? 'fué ANULADO.' : 'ya está disponible.';
            const html_1 = `
        <table style="width: 100%;">
        <tr>
        <td style="text-align: -webkit-center !important; background: #d6d6d6;">
          <div style="width: 600px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" style="background: #FFFFFF;margin-top: 20px;">
                <tr>
                    <td colspan="3" style="text-align: center; padding-top: 10px;">
                        <img src="${SERVERIMG}${_prif}.png" style="max-width: 130px;">                            
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <p style="text-align:center; display: grid;">
                            <span style="color: #65778D; font-weight: bolder; font-size: 24px;">Estimado/a ${_pnombre}</span>
                            <span style="color: #98A7BA; font-size: 14px;">Nos complace informarle que su documento, ${mensaje}. </span>
                        </p>
                    </td>
                </tr>
                <tr >
                    <td colspan="3" style="text-align: center;">
                        <img src=""${SERVERFILE}utils/correoenviado_1.png" style="max-width: 130px;">
                    </td>
                </tr>
                <tr>
                    <td style="height: 400px; display: flex; background: url(${SERVERFILE}utils/fondofacturacorreo.png);background-position: center center;background-repeat: no-repeat;text-align: center;" colspan="3">
                        <div style="width: 400px; display: block; margin-left: 98px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td colspan="2" align="center">
                                        <div style="color: #65778D; margin-top: 50px; text-align: center; width: 120px; padding: 7px; border: 1px solid #d6d6d6; border-radius: 15px; background: #ffffff; font-size: 12px;">${_tipodoc}</div>
                                    </td>
                                </tr>
                                <tr style="height: 70px;">
                                    <td style="text-align: left; padding-left: 30px; padding-top: 10px;">
                                        <span style="color: #65778D; font-size: 13px; font-weight: bold;">RAZÓN SOCIAL</span><br> 
                                        <span style="font-size: 11px; color: #98A7BA;">${_pnombre}</span>
                                    </td>
                                    <td style="text-align: right; padding-right: 30px; padding-top: 10px;">
                                        <span style="color: #65778D; font-size: 13px; font-weight: bold;">NÚMERO IDENTIDAD</span><br> 
                                        <span style="font-size: 11px; color: #98A7BA;">${_rifcliente}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: left; padding-left: 30px; padding-top: 20px;">
                                        <span style="color: #65778D; font-size: 13px; font-weight: bold;">NÚMERO DOCUMENTO</span><br> 
                                        <span style="font-size: 11px; color: #98A7BA;">${numerocuerpo}</span>
                                    </td>
                                    <td style="text-align: right; padding-right: 30px; padding-top: 20px;">
                                        <span style="color: #65778D; font-size: 13px; font-weight: bold;">FECHA EMISIÓN</span><br> 
                                        <span style="font-size: 11px; color: #98A7BA;">${_diaenvio}/${_mesenvio}/${_annioenvio}</span>
                                    </td>
                                </tr>
                            </table>
                            <img src="${SERVERIMG}codeqr/${_prif}/${_annioenvio}-${_mesenvio}/qrcode_${_prif}${_pnumero}.png" style="max-width: 80px; margin-top: 40px;">            
                        </div>
                    </td>
                </tr>
                ${htmlpasarelapago}
                ${htmlpublicidad}
                <tr>
                    <td colspan="3" style="text-align: center; padding: 3px;">
                        <div style="background: #eeeeee; font-size: 13px; padding: 3px;">${_telefono} | ${_emailemisor}<br><span style="font-size: 10px;">${_sitioweb}</span></div>
                    </td>
                </tr>
                <tr style="background: #d6d6d6;">
                    <td style="text-align:center;  padding: 10px 0;" colspan="3">
                        <span style="font-size: 10px; text-align: center;">Este documento se emite bajo la providencia administrativa Nro. SNAT/2014/0032 de fecha 31/07/2014. Imprenta <span style="font-weight: bold;"> SMART INNOVACIONES TECNOLOGICAS, C.A. </span> RIF J-50375790-6, Autorizada según Providencia Administrativa Nro. SENIAT/INTI/011 de fecha 02/10/2023.</span>
                    </td>
                </tr>
                <tr>
                    <td style="text-align:center; background: #d6d6d6; padding: 10px 0;"  colspan="3">
                        <a href="https://smartfactura.net"><img src="${SERVERFILE}utils/logosmartsinfondo.gif" style="width: 130px;"></a>
                    </td>
                </tr>
            </table></div></td></tr></table>
            `;
            // const htmlfinal = _banner === '1' ? html_1 : _banner === '2' ? html_2 : html_3
            const htmlfinal = html_1;
            const arregloemail = _email.split('|');
            const arreglocorreobcc = _emailbcc.split('|');
            console.log('arregloemail');
            console.log(arregloemail);
            const correobcc = arreglocorreobcc ? arreglocorreobcc.join(';') : '';
            // console.log('correobcc')
            // console.log(correobcc)
            let p = 0;
            for (let i = 0; i < arregloemail.length; i++) {
                let mail_options = {
                    from: 'Mi Factura Digital<no-reply@smartfactura.net>',
                    to: arregloemail[i],
                    bcc: correobcc,
                    subject: 'Envío de ' + _tipodoc + ' digital',
                    html: htmlfinal,
                    attachments: [
                        {
                            filename: _tipodoc + '-' + numerocuerpo + '.pdf',
                            path: FILEPDF + _prif + '/' + _annioenvio + '-' + _mesenvio + '/' + _prif + _pnumero
                        }
                    ]
                };
                transporter.sendMail(mail_options, (error, info) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        console.log(error);
                        return res.status(400).send('Error Interno Enviando correo :  ' + error);
                    }
                    else {
                        if (p === 0) {
                            const updcorreo = 'UPDATE t_registros SET estatuscorreo = 1 WHERE numerodocumento = $1 ';
                            yield database_1.pool.query(updcorreo, [_pnumero]);
                            p = 1;
                        }
                        console.log('El correo a ' + arregloemail[i] + ' se envío correctamente ' + info.response);
                    }
                }));
            }
        }
        catch (e) {
            return res.status(400).send('Error Externo Enviando correo :  ' + e);
        }
    });
}
exports.envioCorreo = envioCorreo;
function envioSms(res, _numerotelefono, urlapi, numerointerno, razonsocial, rif, idserviciosmasivo, numerodocumento, anniomeso) {
    try {
        // console.log(_numerotelefono);
        const urlcorter = SERVERFILE + rif + '/' + anniomeso + '/' + rif + numerodocumento;
        // const urlcorter = 'https://bck-test.factura-smart.com/' + rif + '/' + anniomeso + '/' + rif + numerodocumento
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        };
        const body = {
            url: urlcorter
        };
        // shortUrl.short(SERVERFILE + '/' + rif + '/' + anniomeso + '/' + rif + numerodocumento, async function (err: any, url: any) {
        axios_1.default.post('https://spoo.me/', body, { headers }).then((response) => __awaiter(this, void 0, void 0, function* () {
            // console.log('response.status corter:', response.status);
            // console.log('response.statusText corter:', response.statusText);
            if (response.status = 201) {
                console.log('response:', response.data);
                const url = response.data.short_url;
                const operadora = _numerotelefono.substring(2, 5);
                const contenidosms = razonsocial + ' informa: Factura ' + numerointerno + ' ya fue generada. Para ver: ' + url;
                const codeshort = (operadora === '412' || operadora === '414' || operadora === '424') ? '5100' : '1215100';
                const headersjwt = {
                    headers: {
                        Authorization: 'Bearer ' + TOKENAPISMS
                    }
                };
                const jsonbody = {
                    to: _numerotelefono,
                    from: codeshort,
                    content: contenidosms,
                    dlr: "no",
                    coding: "3"
                };
                // console.log(jsonbody)
                const resp = yield axios_1.default.post(urlapi, jsonbody, headersjwt);
                console.log('resp.status sms: ', resp.status);
                console.log('resp.statusText sms: ', resp.statusText);
                if (resp.status === 200) {
                    console.log(resp.data);
                    const sqlupd = "update t_registros set smsenviado = $1 where numerodocumento = $2 and idserviciosmasivo = $3 ";
                    yield database_1.pool.query(sqlupd, [true, numerodocumento, idserviciosmasivo]);
                    return true;
                }
                else {
                    console.log(resp.status);
                    ERRORINT = resp.statusText;
                    return false;
                }
            }
            /*   */
        }));
    }
    catch (e) {
        return res.status(400).send('Error Externo Enviando sms :  ' + e);
    }
}
