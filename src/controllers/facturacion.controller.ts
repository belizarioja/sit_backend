import { Request, Response } from 'express';
import moment from 'moment';
import nodemailer from 'nodemailer';
import fs from 'fs';
import pdf from 'html-pdf';

import { pool } from '../database'

const USERMAIL = process.env.USERMAIL
const PASSMAIL = process.env.PASSMAIL
const SERVERFILE = process.env.SERVERFILE
const SERVERIMG = process.env.SERVERIMG
const HOSTSMTP = process.env.HOSTSMTP

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
process.env['OPENSSL_CONF'] = '/dev/null';

export async function setFacturacion (req: Request, res: Response): Promise<Response | void> {
    try {
        
        const { id, rif, enviocorreo, razonsocial, email, direccion, validarinterno } = req;
        const { rifcedulacliente, nombrecliente, telefonocliente, direccioncliente, idtipodocumento, trackingid, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, tasacambio } = req.body;
        const { emailcliente, subtotal, total, exento, tasar, baser, impuestor, relacionado, idtipocedulacliente, cuerpofactura, sendmail, sucursal, numerointerno, formasdepago, observacion } = req.body;
        // console.log(req.body)
        // console.log('baseigtf, impuestog')
        // console.log(baseigtf, impuestog)
        await pool.query('BEGIN')
        const _tasacambio = tasacambio || 0
      
        const lotepiedepagina = await obtenerLote(res, id)
        if(lotepiedepagina === '0') {
            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 12,
                    message: 'Mo tiene disponibilidad de ASIGNADOS!'
                }
            });
        } 
        if(formasdepago.length === 0) {
            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 13,
                    message: 'Debe incluir al menos una forma de PAGO!'
                }
            });
        } 
        const piedepagina = 'Este documento se emite bajo la providencia administrativa Nro. SNAT/2014/0032 de fecha 31/07/2014. Imprenta SMART INNOVACIONES TECNOLOGICAS, C.A. RIF J-50375790-6, Autorizada según Providencia Administrativa Nro. SENIAT/INTI/008 de fecha 02/10/2023.' + lotepiedepagina
        if(rifcedulacliente.length === 0) {

            await pool.query('ROLLBACK')
            
            return res.status(202).json({
                success: false,
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de RIF CLIENTE no válido!'
                }
            });
        }
        if(nombrecliente.length === 0) {

            await pool.query('ROLLBACK')

            return res.status(202).json({
                success: false,            
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de NOMBRE CLIENTE no válido!'
                }
            });
        }
        // console.log(Number(baseg) * Number(tasag) / 100, Number(impuestog))
        let totalimp = 0
        let totalbase = 0
        // console.log( (Number(baseg) * (Number(tasag) / 100)), Number(impuestog))
        // console.log( (Number(baseg) * (Number(tasag) / 100)).toFixed(2), Number(impuestog).toFixed(2))
        if(Number(baseg) > 0 && Number(tasag) > 0) {
            if((Number(baseg) * (Number(tasag) / 100)).toFixed(2) !== Number(impuestog).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IVA ' + tasag + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestog)
                totalbase += Number(baseg)
            }
        }

        if(Number(baser) > 0 && Number(tasar) > 0) {
            if((Number(baser) * (Number(tasar) / 100)).toFixed(2) !== Number(impuestor).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO REDUCIDO ' + tasar + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestor)
                totalbase += Number(baser)
            }
        }
        if(Number(baseigtf) > 0 && Number(tasaigtf) > 0) {
            if((Number(baseigtf) * (Number(tasaigtf) / 100)).toFixed(2) !== Number(impuestoigtf).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de IMPUESTO IGTF ' + tasaigtf + '% MAL CALCULADO!'
                    }
                });
            } else {
                totalimp += Number(impuestoigtf)
                // totalbase += Number(baseigtf)
            }
        }
        if(Number(exento) > 0) {
            totalbase += Number(exento)
        }
        if(Number(subtotal) > 0) {
            // console.log(Number(totalbase), Number(subtotal))
            if(Number(totalbase).toFixed(2) !== Number(subtotal).toFixed(2)) {

                await pool.query('ROLLBACK')

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
            if((Number(subtotal) + Number(totalimp)).toFixed(2) !== Number(total).toFixed(2)) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor de TOTAL MAL CALCULADO!'
                    }
                });
            } 
        } else {

            await pool.query('ROLLBACK')

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
        if((idtipodocumento === 2 || idtipodocumento === 3) && !relacionado) {

            await pool.query('ROLLBACK')

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
        if(idtipodocumento === 2 || idtipodocumento === 3) {

            const sqlrel = " SELECT * FROM t_registros ";
            const whererel = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
            // console.log(sqlupd + whereupd)

            const resprel = await pool.query(sqlrel + whererel, [id, relacionado])           

            if(resprel.rows.length === 0 ) {
            
                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 11,
                        message: 'NUMERO DOCUMENTO no corresponde al cliente emisor!'
                    }
                });
            } else {
                // console.log('resprel.rows[0]')
                // console.log(resprel.rows[0])
                numeroafectado = resprel.rows[0].numerointerno.length > 0 ? resprel.rows[0].numerointerno : relacionado
                fechaafectado = resprel.rows[0].fecha
                idtipoafectado = resprel.rows[0].idtipodocumento
                
            }
        }
        if (enviocorreo == 1 && cuerpofactura.length === 0) {

            await pool.query('ROLLBACK')

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
        const resp = await pool.query(sql + set + where, [id]);

        let identificador = Number(resp.rows[0].identificador)
        let corelativo = Number(resp.rows[0].corelativo)
       
        // AQUI VALIDAR NU8MERO INTERNO
       
        if(validarinterno > 0) {
            // console.log('Aqui función para validar numero interno 1:', numerointerno)
            if(numerointerno?.length === 0) {
                // console.log('Aqui función para validar numero interno 2:', numerointerno)
                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 7,
                        message: 'Falta valor del NÚMERO INTERNO!'
                    }
                });
            } else {

                const sqlinterno = "SELECT * FROM t_registros";
                const whareinterno = " WHERE numerointerno = $1 AND idtipodocumento = $2 AND idserviciosmasivo = $3  ";
                const respinterno = await pool.query(sqlinterno + whareinterno, [numerointerno, idtipodocumento, id]); 
              
                if(respinterno.rows.length > 0) {
                    await pool.query('ROLLBACK')

                    return res.status(202).json({
                        success: false,
                        data: null,
                        error: {
                            code: 8,
                            message: 'NÚMERO INTERNO para este TIPO DE DOCUMENTO, ya existe!'
                        }
                    });
                } else {
                    // console.log('Aqui función para validar numero interno 3 :', numerointerno)                  
                    const respinterno2 = await obtenerNumInterno(idtipodocumento, id)
                     if( Number(respinterno2) > 0 && (Number(respinterno2) + 1 !== Number(numerointerno))) {
              
                        await pool.query('ROLLBACK')

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
     
        const numerocompleto =  identificador.toString().padStart(2, '0') + '-' + corelativo.toString().padStart(8, '0')
        const relacionadoBD = relacionado || ''
        const observacionBD = observacion || ''
        const fechaenvio = moment().format('YYYY-MM-DD HH:mm:ss')
        const insert = 'INSERT INTO t_registros (numerodocumento, idtipodocumento, idserviciosmasivo, trackingid, cedulacliente, nombrecliente, subtotal, total, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, fecha, exento, tasar, baser, impuestor, estatus, relacionado, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, secuencial, tasacambio, observacion ) '
        const values = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 1, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING id '
        const respReg = await pool.query(insert + values, [numerocompleto, idtipodocumento, id, trackingid, rifcedulacliente, nombrecliente, subtotal, total, tasag, baseg, impuestog, tasaigtf, baseigtf, impuestoigtf, fechaenvio, exento, tasar, baser, impuestor, relacionadoBD, idtipocedulacliente, emailcliente, sucursal, numerointerno, piedepagina, direccioncliente, telefonocliente, Number(numerointerno), _tasacambio, observacionBD])
        // console.log(respReg.rows[0].id)
        const idRegistro = respReg.rows[0].id
        for(const ind in cuerpofactura) {
            const item = cuerpofactura[ind]
           
            // console.log(Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100, Math.round(item.monto * 100) / 100)
            if(Math.round((item.precio * item.cantidad - item.descuento) * 100) / 100 !== Math.round(item.monto * 100) / 100) {

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 4,
                        message: 'Valor del MONTO DE UN REGISTRO, MAL CALCULADO!'
                    }
                });
            } 

            const insertDet = 'INSERT INTO t_registro_detalles (idregistro, codigo, descripcion, precio, cantidad, tasa, monto, exento, comentario, descuento ) '
            const valuesDet = ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) '
            await pool.query(insertDet + valuesDet, [idRegistro, item.codigo, item.descripcion, item.precio, item.cantidad, item.tasa, item.monto, item.exento, item.comentario, item.descuento])
            // console.log(insertDet + valuesDet)
        }
        
        for(const ind in formasdepago) {
            const item2 = formasdepago[ind]
           
            // console.log((Number(item.precio) * Number(item.cantidad) + Number(item.impuesto)).toFixed(2), Number(item.monto).toFixed(2))
            if(item2.forma.length === 0 ){

                await pool.query('ROLLBACK')

                return res.status(202).json({
                    success: false,
                    data: null,
                    error: {
                        code: 14,
                        message: 'Informacion de forma de pago NO VALIDA!'
                    }
                });
            } 

            const insertForma = 'INSERT INTO t_formasdepago (idregistro, forma, valor ) '
            const valuesForma = ' VALUES ($1, $2, $3) '
            await pool.query(insertForma + valuesForma, [idRegistro, item2.forma, item2.valor])
            // console.log(insertDet + valuesDet)
        }
       
        await pool.query('COMMIT')
       

        console.log('Envio de correo', enviocorreo, sendmail, cuerpofactura.length, emailcliente)
        if (cuerpofactura.length > 0) {
            console.log('va a Crear pdf correo')
            await crearFactura(res, rif, razonsocial, direccion, numerocompleto, nombrecliente, cuerpofactura, emailcliente, rifcedulacliente, idtipocedulacliente, telefonocliente, direccioncliente, numerointerno, id, email, idtipodocumento, numeroafectado, impuestoigtf, fechaafectado, idtipoafectado, piedepagina, baseigtf, fechaenvio, formasdepago, enviocorreo, sendmail, _tasacambio, observacionBD)
            
        } else {
            console.log('Sin Factura pdf correo')
        }
        const data = {
            success: true,
            error: null,
            data: {
                numerodocumento:  numerocompleto,
                identificador: identificador.toString().padStart(2, '0'),
                corelativo: corelativo.toString().padStart(8, '0'),
                datatime: moment().format('YYYY-MM-DD HH:mm:ss'),
                fecha: moment().format('YYYYMMDD'),
                hora: moment().format('HH:mm:ss')
            }           
        };
        return res.status(200).json(data); 

    }
    catch (e) {
        return res.status(400).send('Error Creando correlativo o cuerpo de factura ' + e);
    }
}
async function obtenerNumInterno(idtipodocumento: any, idserviciosmasivo: any) {
    const sql = "SELECT MAX(secuencial) FROM t_registros";
    const where = " WHERE idtipodocumento = " + idtipodocumento + " AND idserviciosmasivo = " + idserviciosmasivo;
    // console.log(sqlinterno2 + whareinterno2)
    const resp = await pool.query(sql + where); 
    return resp.rows[0].max;    
}
export async function getNumerointerno (req: Request, res: Response): Promise<Response | void> {
    try {
        
        const { id } = req;
        const { idtipodocumento } = req.body;
        const resp = await obtenerNumInterno(idtipodocumento, id) 
        const numeronext = Number(resp) + 1
        const data = {
            success: true,
            error: null,
            data: {
                numerointerno:  numeronext.toString().padStart(8, '0')
            }           
        };
        return res.status(200).json(data); 
    }catch (e) {
        return res.status(400).send('Error Obteniendo numero Interno ' + e);
    }
}

export async function crearFactura (res: Response,_rif: any, _razonsocial: any, _direccion: any, _pnumero: any, _nombrecliente: any, productos: any, _emailcliente: any, _rifcliente: any, _idtipocedula: any, _telefonocliente: any, _direccioncliente: any, _numerointerno: any, _id: any, _emailemisor: any, _idtipodoc: any, _numeroafectado: any, _impuestoigtf: any, _fechaafectado: any, _idtipoafectado: any, _piedepagina: any, _baseigtf: any, _fechaenvio: any, _formasdepago: any, _enviocorreo: any, _sendmail: any, _tasacambio: any, _observacion: any) {
    try {
        const sqlsede = "SELECT a.telefono, a.sitioweb, a.banner, b.colorfondo1, b.colorfuente1, b.colorfondo2, b.colorfuente2, a.textoemail, b.banner  ";
        const fromsede = " FROM t_serviciosmasivos a ";
        let leftjoin = " left join t_plantillacorreos b ON a.banner = b.banner and a.id = b.idserviciosmasivo  ";
        const wheresede = " WHERE a.id = $1";
        const respsede = await pool.query(sqlsede + fromsede + leftjoin + wheresede, [_id]); 
        // console.log(respsede.rows[0])
        const sitioweb = respsede.rows[0].sitioweb
        const colorfondo1 = respsede.rows[0].colorfondo1 || '#d4e5ff'
        const colorfuente1 = respsede.rows[0].colorfuente1 || '#000000'
        const colorfondo2 = respsede.rows[0].colorfondo2 || '#edfbf4'
        const colorfuente2 = respsede.rows[0].colorfuente2 || '#666666'
        const textoemail = respsede.rows[0].textoemail || '0'
        const banner = respsede.rows[0].banner || '1'
        const _telefono = respsede.rows[0].telefono

        // const ubicacionPlantilla = require.resolve("../plantillas/factura.html");
        const ubicacionPlantilla = require.resolve("../plantillas/" + _rif + ".html");
        let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
        // Estos productos podrían venir de cualquier lugar
        

        // Nota: el formateador solo es para, valga la redundancia, formatear el dinero. No es requerido, solo que quiero que se vea bonito
        // https://parzibyte.me/blog/2021/05/03/formatear-dinero-javascript/
        // const formateador = new Intl.NumberFormat("eu");
        // Generar el HTML de la tabla
        let tabla = "";
        let subtotal = 0;
        let exentos = 0;
        // let descuento = 0;
        let impuestos = 0;
        let baseiva = 0;
        
        for (const producto of productos) {
            // Aumentar el total
            const totalProducto = (producto.cantidad * producto.precio) - producto.descuento;
            subtotal += totalProducto;
            // descuento += producto.descuento
            if (producto.exento === true || producto.exento === 'true') { 
                exentos += totalProducto
            } else {
                impuestos += totalProducto * producto.tasa / 100
                baseiva += totalProducto;

            }
            let productoitem = `<span>${producto.descripcion}</span>`
           
            if(producto.comentario.length > 0) {
                productoitem += `<br><span>${producto.comentario}</span>`
            }
            // Y concatenar los productos
          
            tabla += `<tr style="height: 25px;">
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px solid;padding: 3px;">${producto.codigo}</td>
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px solid;padding: 3px;">${productoitem}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;">${producto.cantidad}</td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.precio))}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;">${producto.tasa}%</td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.descuento))}</td>
            <td class="text-right" style="vertical-align: baseline;border-right: 1px solid; border-left: 1px solid;padding: 3px;font-size: 8px;">${completarDecimales(Number(producto.monto))}</td>
            </tr>`;
        
        }
        const coletillaigtf = "En caso de Factura emitida en divisas según articulo Nro. 25 del Decreto con rango valor y fuerza de ley que establece el IVA modificado en GACETA OFICIAL Nro. 6152 de fecha 18/11/2014. "
        const coletillabcv = "Artículo 25: "
        const coletillabcv2 = '"En los casos en que la base imponible de la venta o prestación de servicios estuviese expresada en moneda extranjera se establecerá la equivalencia en moneda nacional al tipo de cambio corriente en el mercado del día en que ocurra el hecho imponible salvo que este ocurra en un día no hábil para el sector financiero en cuyo caso se aplicará el vigente en el día hábil inmediatamente siguiente el de la operación."'
        let coletilla = coletillaigtf + coletillabcv + coletillabcv2
        const tipodoc = Number(_idtipodoc) === 1 ? 'Factura' : Number(_idtipodoc) === 2 ? 'Nota de débito' : Number(_idtipodoc) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho'
            
        tabla += `<tr style="height: 25px;">
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px solid;padding: 3px;"></td>
            <td style="vertical-align: baseline;font-size: 8px;border-left: 1px solid;padding: 3px;">${_observacion}</td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;"></td>
            <td class="text-center" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-left: 1px solid;padding: 3px;font-size: 8px;"></td>
            <td class="text-right" style="vertical-align: baseline;border-right: 1px solid; border-left: 1px solid;padding: 3px;font-size: 8px;"></td>
            </tr>`;
        tabla += `<tr style="height: auto;">
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
            <td style="border-bottom: 1px solid;border-right: 1px solid; border-left: 1px solid;font-size: 8px;line-height: 1;">&nbsp;</td>
        </tr>`;
            
        let trbaseigtf = `<tr>
            <td class=" text-right" style="font-size: 8px;">IGTF 3%(${completarDecimales(Number(_baseigtf))}) Bs.:</td>
            <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtf))}</td>
        </tr>`
        
        let _impuestoigtfusd = 0
        let _baseigtfusd = 0
        let _baseivausd = 0

        if (_tasacambio > 0) {
            _impuestoigtfusd = Number(_impuestoigtf)/Number(_tasacambio)
            _baseigtfusd = Number(_baseigtf)/Number(_tasacambio)
            _baseivausd = Number(baseiva)/Number(_tasacambio)
            
            trbaseigtf = `<tr>
                <td class="text-right" style="font-size: 8px;">IGTF 3%(Sobre ${completarDecimales(Number(_baseigtfusd))}) $:</td>
                <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtfusd))}</td>
                <td class="text-right" style="font-size: 8px;">IGTF 3%(Sobre ${completarDecimales(Number(_baseigtf))}) Bs.:</td>
                <td class="text-right" style="font-size: 8px;">${completarDecimales(Number(_impuestoigtf))}</td>
            </tr>` 
          
            contenidoHtml = contenidoHtml.replace("{{tasatotales}}", _tasacambio.toString().padEnd(9, '0'));           
        }
        // const subtotalConDescuento = subtotal - descuento;        
        const subtotalConDescuento = subtotal;
        // console.log(subtotalConDescuento, impuestos, _impuestoigtf)
        const total = subtotalConDescuento + impuestos + Number(_impuestoigtf);
        // console.log(total)
        // const fecha = moment().format('DD/MM/YYYY hh:mm:ss a');
        // Remplazar el valor {{tablaProductos}} por el verdadero valor
        contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);

        let formasdepago = "";
        for (const forma of _formasdepago) {
            formasdepago += `${forma.forma} Bs.: ${completarDecimales(Number(forma.valor))}<br>`            
        }

        const emailpdf =_emailcliente.split('|').join(', ')

        const tipocedula = Number(_idtipocedula) === 1 ? 'CI' : Number(_idtipocedula) === 2 ? 'Pasaporte' : 'RIF'
        const docafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ? 'Aplica a:' : ''
        const tipoafectado = Number(_idtipoafectado) === 1 ? 'Factura' : Number(_idtipoafectado) === 2 ? 'Nota de débito' : Number(_idtipoafectado) === 3 ? 'Nota de crédito' : Number(_idtipodoc) === 4 ? 'Orden de entrega' : 'Guía de despacho'
        const numeroafectado = (Number(_idtipodoc) === 2 || Number(_idtipodoc) === 3) ? '<br>' + tipoafectado + '<br>' + _numeroafectado + '<br>' + moment(_fechaafectado).format('DD/MM/YYYY hh:mm:ss a') : ''
        
        contenidoHtml = contenidoHtml.replace("{{logo}}", SERVERIMG+_rif + ".png");
        contenidoHtml = contenidoHtml.replace("{{direccion}}", _direccion);
        contenidoHtml = contenidoHtml.replace("{{razonsocial}}", _razonsocial);
        contenidoHtml = contenidoHtml.replace("{{rif}}", _rif);
        contenidoHtml = contenidoHtml.replace("{{telefono}}", _telefono);
        contenidoHtml = contenidoHtml.replace("{{numerodocumento}}", _pnumero);
        contenidoHtml = contenidoHtml.replace("{{numerointerno}}", _numerointerno);
        contenidoHtml = contenidoHtml.replace("{{tipodocumento}}", tipodoc);
        contenidoHtml = contenidoHtml.replace("{{numeroafectado}}", numeroafectado);
        contenidoHtml = contenidoHtml.replace("{{documentoafectado}}", docafectado);
        contenidoHtml = contenidoHtml.replace("{{tipocedula}}", tipocedula);
        contenidoHtml = contenidoHtml.replace("{{direccioncliente}}", _direccioncliente);
        contenidoHtml = contenidoHtml.replace("{{telefonocliente}}", _telefonocliente);
        contenidoHtml = contenidoHtml.replace("{{emailcliente}}", emailpdf);
        contenidoHtml = contenidoHtml.replace("{{cedulacliente}}", _rifcliente);

        contenidoHtml = contenidoHtml.replace("{{monedabs}}", 'Moneda Bs.');

        contenidoHtml = contenidoHtml.replace("{{nombrecliente}}", _nombrecliente);
    
        contenidoHtml = contenidoHtml.replace("{{fechaasignacion}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY"));
        contenidoHtml = contenidoHtml.replace("{{fecha}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY"));
        contenidoHtml = contenidoHtml.replace("{{hora}}", moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("hh:mm:ss a"));

        contenidoHtml = contenidoHtml.replace("{{piedepagina}}", _piedepagina);
        contenidoHtml = contenidoHtml.replace("{{formasdepago}}", formasdepago);      
        
        contenidoHtml = contenidoHtml.replace("{{trbaseigtf}}", trbaseigtf);
        let subtotalusd = 0
        let impuestosusd = 0
        let exentosusd = 0
        let totalusd = 0
        if (_tasacambio > 0) {
            
            subtotalusd = Number(subtotal)/Number(_tasacambio)
            impuestosusd = Number(impuestos)/Number(_tasacambio)
            exentosusd = Number(exentos)/Number(_tasacambio)
            totalusd = Number(total)/Number(_tasacambio)
        
            contenidoHtml = contenidoHtml.replace("{{baseivausd}}", completarDecimales(Number(_baseivausd)));
            contenidoHtml = contenidoHtml.replace("{{subtotalusd}}", completarDecimales(Number(subtotalusd)));
            contenidoHtml = contenidoHtml.replace("{{impuestosusd}}", completarDecimales(Number(impuestosusd)));
            contenidoHtml = contenidoHtml.replace("{{exentosusd}}", completarDecimales(Number(exentosusd)));
            contenidoHtml = contenidoHtml.replace("{{totalusd}}", completarDecimales(Number(totalusd)));            
        
        }
        contenidoHtml = contenidoHtml.replace("{{subtotal}}", completarDecimales(Number(subtotal)));
        contenidoHtml = contenidoHtml.replace("{{baseiva}}", completarDecimales(Number(baseiva)));
        contenidoHtml = contenidoHtml.replace("{{impuestos}}", completarDecimales(Number(impuestos)));
        contenidoHtml = contenidoHtml.replace("{{exentos}}", completarDecimales(Number(exentos)));        
        contenidoHtml = contenidoHtml.replace("{{total}}", completarDecimales(Number(total)));
        
        contenidoHtml = contenidoHtml.replace("{{coletilla}}", coletilla);
        const annioenvio = moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("YYYY")
        const mesenvio = moment(_fechaenvio, "YYYY-MM-DD HH:mm:ss").format("MM")
        pdf.create(contenidoHtml, { format: "Letter" }).toFile("dist/controllers/temp/" + _rif + "/" + annioenvio + "-"  + mesenvio + "/" + _rif + _pnumero + ".pdf", async (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
                return res.status(400).send('Error Interno Creando pdf :  ' + error);
            } else {
                console.log("PDF creado correctamente");               
                if (_enviocorreo == 1 && _sendmail == 1 && productos.length > 0 && _emailcliente?.length > 0) {

                    console.log('va a Enviar correo')
                    // await envioCorreo(res, _nombrecliente, _pnumero, _rif, _emailcliente, _telefono, colorfondo1, colorfuente1, colorfondo2, colorfuente2, sitioweb, textoemail, banner, _emailemisor, _numerointerno, tipodoc)

                } else {
                    console.log('Sin correo')
                }
            }
        });
    } catch (e) {
        return res.status(400).send('Error Externo Creando pdf :  ' + e);
    }

}

function completarDecimales (cadena: any) {
    cadena = Intl.NumberFormat('de-DE').format(cadena.toFixed(2))
    const arreglo = cadena.split(',')
    cadena = arreglo.length === 1 ? cadena + ',00' : arreglo[1].length === 1 ? cadena + '0' : cadena
    return cadena
}

async function obtenerLote (res: Response, id: any) {
    try {

        const sql = "SELECT a.id, a.inicia, a.termina, a.fechaproduccion, a.utilizado ";
        const from = " FROM t_tranzascorrelativo a, t_serviciosdoc b  ";
        const where = " WHERE a.idserviciosmasivo = b.idserviciosmasivo and b.corelativo + 1 >= a.inicia::numeric and b.corelativo < a.termina::numeric and a.estatus = 1 and a.idserviciosmasivo = $1";
        const respReg = await pool.query(sql + from + where, [id])
        // console.log(respReg.rows)
        if(respReg.rows.length > 0) {

            const id = respReg.rows[0].id
          
            const utilizado = Number(respReg.rows[0].utilizado) + 1
            const update = "update t_tranzascorrelativo ";
            let set = " set utilizado = $1 ";
            let fechapiedepagina = moment().format('DD/MM/YYYY')
            // console.log(respReg.rows[0].fechaproduccion)
            if(!respReg.rows[0].fechaproduccion || respReg.rows[0].fechaproduccion == null || respReg.rows[0].fechaproduccion == 'null') {
                // console.log('respReg.rows[0].fechaproduccion')
                set += ", fechaproduccion = '" + moment().format("YYYY-MM-DD") + "'";                

            } else {
                fechapiedepagina = moment(respReg.rows[0].fechaproduccion).format('DD/MM/YYYY')
            }
            const whereupdate = " where id = $2";
            await pool.query(update + set + whereupdate, [utilizado, id])
        
            const numerolote = ' Desde Nro. de Control 00-' + respReg.rows[0].inicia.toString().padStart(8, '0') + ' Hasta Nro. 00-' + respReg.rows[0].termina.toString().padStart(8, '0') + ' de fecha ' + fechapiedepagina + '.'
            return numerolote
        } else {
            return '0'
        }
    }
    catch (e) {
        console.log('Error Consultando asignacion :  ' + e);
        return '0'
    }
}

export async function envioCorreo (res: Response, _pnombre: any, _pnumero: any, _prif: any, _email: any, _telefono: any, _colorfondo1: any, _colorfuente1: any, _colorfondo2: any, _colorfuente2: any, _sitioweb: any, _texto: any, _banner: any, _emailemisor: any, _numerointerno: any, _tipodoc: any) {
    try {
        console.log('USERMAIL, PASSMAIL')
        console.log(USERMAIL, PASSMAIL)
        let transporter = nodemailer.createTransport({
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
        
        const numerocuerpo = _numerointerno.length > 0 ? _numerointerno : _pnumero
        const footer = `<tr height="50px">
                            <td style="text-align:center; width: 20%;">
                                <img src="${SERVERFILE}utils/logonovuscorreo.png" style="max-width: 82px;">
                            </td>
                            <td style="text-align:left;"  colspan="3">
                                <span style="font-weight: bolder;">Este documento está avalado por NOVUS, Imprenta Digital autorizada por
                                el SENIAT, bajo el No. INTI/0007, según la providencia 0032.</span>
                            </td>
                        </tr>`;
        const texto_1 = _texto !== '0' ? `<tr>  
                            <td colspan="3">      
                                <div style="background: ${_colorfondo2}; margin-bottom: 30px; padding: 15px; font-size: 16px; color: ${_colorfuente2};">
                                <p style="text-align:left;">
                                    ${_texto}
                                </p>
                            </div> 
                            </td>
                        </tr>` : ''
        const html_1 = `<div style="width: 100%;display: flex;justify-content: center;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" bgcolor="#fff" style="border: 1px solid #d6d6d6;">
                <tr height="240px">  
                    <td colspan="3" style="background: url(${SERVERFILE}utils/bannercorreo_${_banner}.png); text-align: left; padding-left: 75px;">
                        <img src="${SERVERIMG}${_prif}.png" style="max-width: 130px;">                            
                    </td>
                </tr>
                <tr>  
                    <td style="text-align:center" colspan="3">      
                        <div style="background: ${_colorfondo1}; margin: 30px; padding: 30px; border-radius: 15px; font-size: 24px; color: ${_colorfuente1};">
                            <p style="text-align:center; display: grid;">
                                <span>Estimado Cliente: <span style="color: #9d9456; font-weight: bolder;">${_pnombre}.</span></span>
                                <span>Le informamos que su ${_tipodoc},</span>
                                <span>No.: <span style="color: #9d9456; font-weight: bolder;">${numerocuerpo},</span></span>
                                <span>está disponible como archivo adjunto. </span>
                            </p>
                            <!-- <p style="text-align:center">
                                También La puede obtener, accediendo a este enlace 
                                <span style="color: #9d9456; font-weight: bolder;">
                                    <a href="${SERVERFILE}${_prif}${_pnumero}">Ver factura</a>.                                
                                </span> 
                            </p> -->
                        </div> 
                    </td>
                </tr>
                ${texto_1}
                <tr height="80px" style="background: url(${SERVERFILE}utils/fondofootercorreo.png);">
                    <td style="text-align:center; width: 20%;">
                        <img src="${SERVERFILE}utils/logobiocorreo.png" style="max-width: 50px;">
                    </td>
                    <td style="text-align:left; width: 24%">
                        <span style="color: #fff; font-weight: bolder;">Nuestro sistema SIN impresiones protege el medio ambiente.</span>
                    </td>
                    <td style=" text-align: right; display: grid; padding: 10px;">
                        <span style="color: #000; font-weight: bolder;">${_telefono}</span>
                        <span style="color: #000; font-weight: bolder;">${_emailemisor}</span>
                        <span style="color: #000; font-weight: bolder;">${_sitioweb}</span>
                    </td>
                </tr>
                ${footer}
            </table></div>
            `;
            const html_2 = `<div style="width: 100%;display: flex;justify-content: center;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" bgcolor="#fff" style="border: 1px solid #d6d6d6;">
                <tr height="306px">  
                    <td colspan="3" style="background: url(${SERVERFILE}utils/bannercorreo_${_banner}.png); text-align: right; padding-right: 30px; padding-top: 140px;">
                        <img src="${SERVERIMG}${_prif}.png" style="max-width: 130px;"> 
                    </td>
                </tr>
                <tr>  
                    <td style="text-align:center" colspan="3">      
                        <div style="background: ${_colorfondo1};padding: 30px; font-size: 24px; color: ${_colorfuente1};">
                            <p style="text-align:center; display: grid;">
                                <span>Estimado Cliente: <span style="color: #9d9456; font-weight: bolder;">${_pnombre}.</span></span>
                                <span>Le informamos que su ${_tipodoc},</span>
                                <span>No.: <span style="color: #9d9456; font-weight: bolder;">${numerocuerpo},</span></span>
                                <span>está disponible como archivo adjunto. </span>
                            </p>
                            <!-- <p style="text-align:center">
                                También La puede obtener, accediendo a este enlace 
                                <span style="color: #9d9456; font-weight: bolder;">
                                    <a href="${SERVERFILE}${_prif}${_pnumero}">Ver factura</a>.                                
                                </span> 
                            </p> -->
                        </div> 
                    </td>
                </tr>
                ${texto_1}
                <tr height="80px" style="background: url(${SERVERFILE}utils/fondofootercorreo.png);">
                    <td style="text-align:center; width: 20%;">
                        <img src="${SERVERFILE}utils/logobiocorreo.png" style="max-width: 50px;">
                    </td>
                    <td style="text-align:left; width: 24%">
                        <span style="color: #fff; font-weight: bolder;">Nuestro sistema SIN impresiones protege el medio ambiente.</span>
                    </td>
                    <td style=" text-align: right; display: grid; padding: 10px;">
                        <span style="color: #000; font-weight: bolder;">${_telefono}</span>
                        <span style="color: #000; font-weight: bolder;">${_emailemisor}</span>
                        <span style="color: #000; font-weight: bolder;">${_sitioweb}</span>
                    </td>
                </tr>
                ${footer}
            </table></div>
            `;
            const html_3 = `<div style="width: 100%;display: flex;justify-content: center;">
            <table border="0" cellpadding="0" cellspacing="0" width="600px" bgcolor="#fff" style="border: 1px solid #d6d6d6;">
                <tr height="308px">  
                    <td colspan="3" valign="top" style="background: url(${SERVERFILE}utils/bannercorreo_${_banner}.png); text-align: right; padding-right: 10px;">
                        <img src="${SERVERIMG}${_prif}.png" style="max-width: 180px;"> 
                    </td>
                </tr>
                <tr>  
                    <td style="text-align:left" colspan="3">      
                        <div style="background: ${_colorfondo1};padding: 30px; font-size: 24px; color: ${_colorfuente1};">
                            <p style="display: grid;">
                                <span>Estimado Cliente: <span style="color: #9d9456; font-weight: bolder;">${_pnombre}.</span></span>
                                <span>Le informamos que su ${_tipodoc},</span>
                                <span>No.: <span style="color: #9d9456; font-weight: bolder;">${numerocuerpo},</span></span>
                                <span>está disponible como archivo adjunto. </span>
                            </p>
                            <!-- <p style="text-align:center">
                                También La puede obtener, accediendo a este enlace 
                                <span style="color: #9d9456; font-weight: bolder;">
                                    <a href="${SERVERFILE}${_prif}${_pnumero}">Ver factura</a>.                                
                                </span> 
                            </p> -->
                        </div> 
                    </td>
                </tr>
                ${texto_1}
                <tr height="80px">
                    <td style="text-align:center; width: 20%;border-bottom: 1px solid;">
                        <img src="${SERVERFILE}utils/logobiocorreo.png" style="max-width: 50px;">
                    </td>
                    <td style="text-align:left; width: 24%; border-bottom: 1px solid;">
                        <span style="color: #79BD75; font-weight: bolder;">Nuestro sistema SIN impresiones protege el medio ambiente.</span>
                    </td>
                    <td style=" text-align: right; display: grid; padding: 10px; border-bottom: 1px solid;">
                        <span style="color: #575756; font-weight: bolder;">${_telefono}</span>
                        <span style="color: #575756; font-weight: bolder;">${_emailemisor}</span>
                        <span style="color: #575756; font-weight: bolder;">${_sitioweb}</span>
                    </td>
                </tr>
                ${footer}
            </table></div>
            `;
        const htmlfinal = _banner === '1' ? html_1 : _banner === '2' ? html_2 : html_3
        const arregloemail = _email.split('|')
        let p = 0;
         for(let i = 0; i< arregloemail.length; i++) {
            let mail_options = {
                from: 'SIT <info@smart.com>',
                to: arregloemail[i],
                subject: 'Smart - Factura Digital',
                html: htmlfinal /* ,
                attachments: [
                {
                    filename: _tipodoc + '-' + numerocuerpo + '.pdf',
                    path: SERVERFILE + _prif + _pnumero
                } 
            ] */
            };
            transporter.sendMail(mail_options, async (error: any, info: { response: string; }) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send('Error Interno Enviando correo :  ' + error);
                } else {                          
                    if(p === 0) {
                        const updcorreo = 'UPDATE t_registros SET estatuscorreo = 1 WHERE numerodocumento = $1 '
                        // console.log(_pnumero);
                        await pool.query(updcorreo, [_pnumero])  
                        // console.log("p");
                        // console.log(p);
                        p = 1;   
                    }                   
                    console.log('El correo a ' + arregloemail[i] + ' se envío correctamente ' + info.response);
                }
            });
        }
        

    }
    catch (e) {
        return res.status(400).send('Error Externo Enviando correo :  ' + e);
    }

}
