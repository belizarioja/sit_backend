import { Request, Response } from 'express';
import moment from 'moment';

// DB
import { pool } from '../database'


export async function getFacturaDet (req: Request, res: Response): Promise<Response | void> {
    try {
        const { id } = req.params;

        const sql = "select id, codigo, descripcion, comentario, precio, cantidad, tasa, monto, exento, descuento ";
        const from = " from t_registro_detalles ";
        const where = " where idregistro = " + id;
        // console.log(sql + from + where)
        const resp = await pool.query(sql + from + where);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Buscando Detalles Facturas' + e);
    }
}
export async function getFacturas (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idserviciosmasivo, idtipodocumento, numerodocumento, desde, hasta, exento, impuestog, impuestor, impuestoigtf, estatus, cedulacliente, idcodigocomercial } = req.body;
        const { page, size} = req.body;

        let sql = "select a.id, a.idserviciosmasivo, c.razonsocial, c.rif, c.direccion, c.telefono, a.numerodocumento, a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, c.enviocorreo, a.estatuscorreo, a.emailcliente, c.idcodigocomercial, ";
        sql += " a.trackingid, a.fecha, a.tasag, a.baseg, a.impuestog, a.tasar, a.baser, a.impuestor, a.tasaigtf, a.baseigtf, a.impuestoigtf, a.subtotal, a.total, a.exento, a.estatus, a.observacion, a.relacionado, a.fechaanulado, d.abrev, a.idtipocedulacliente, a.numerointerno, a.piedepagina ";
        
        const sqlCount = "select count (*) ";
        // const from = " from t_registros a, t_tipodocumentos b, t_serviciosmasivos c , t_tipocedulacliente d, t_registros e,  ";
        const from = " from t_registros a  ";
        // let leftjoin = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id and a.idtipocedulacliente = d.id and a.estatus = " + estatus;
        let leftjoin = " left join t_tipodocumentos b ON a.idtipodocumento = b.id  ";
        leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
        leftjoin += " left join t_tipocedulacliente d ON a.idtipocedulacliente = d.id  ";     
        
        let where = " where a.idserviciosmasivo > 0 ";
        if(estatus !== 4) {
            where += " and a.estatus = " + estatus;
        }
        if(idcodigocomercial) {
            where += " and c.idcodigocomercial = " + idcodigocomercial;
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(idtipodocumento) {
            console.log(idtipodocumento)
            where += " and a.idtipodocumento in (" + idtipodocumento + ")";
        }
        if(numerodocumento) {
            where += " and a.numerodocumento = '" + numerodocumento + "'";
        }
        if(cedulacliente) {
            where += " and a.cedulacliente = '" + cedulacliente + "'";
        }
        if(desde && hasta) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        if(exento) {
            where += " and a.exento > 0 ";
        }
        if(impuestog) {
            where += " and a.impuestog > 0 ";
        }
        if(impuestor) {
            where += " and a.impuestor > 0 ";
        }
        if(impuestoigtf) {
            where += " and a.impuestoigtf > 0 ";
        }
        const orderBy = ' order by a.fecha desc, a.numerodocumento desc '
        const limit =' LIMIT $2  OFFSET (($1 - 1) * $2);'

        const respTotal = await pool.query(sqlCount + from + leftjoin + where);
        // console.log(sql + from + leftjoin+ where + orderBy + limit)
        const resp = await pool.query(sql + from + leftjoin + where + orderBy + limit, [page, size]);
        const totalpages = parseInt(respTotal.rows[0].count)/size
        // console.log(Math.trunc(totalpages))
        // console.log(totalpages % 1)
        const total_pages = totalpages % 1 > 0 ? Math.trunc(totalpages) + 1 : Math.trunc(totalpages)
        const data = {
            succes: true,
            data: resp.rows,
            page: page,
            rowsPerPage: size,
            total_pages: total_pages,
            rowsNumber: Number(respTotal.rows[0].count)
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Facturas' + e);
    }
}
export async function getFacturaNum (req: Request, res: Response): Promise<Response | void> {
    try {
        const { numerodocumento, idserviciosmasivo } = req.body;

        let sql = "select a.id, c.razonsocial, c.rif, c.direccion, c.telefono, a.numerodocumento, a.cedulacliente, a.nombrecliente, a.direccioncliente, a.telefonocliente, a.idtipodocumento, b.tipodocumento, ";
        sql += " a.trackingid, a.fecha, a.tasag, a.baseg, a.impuestog, a.tasar, a.baser, a.impuestor, a.tasaigtf, a.baseigtf, a.impuestoigtf, a.subtotal, a.total, a.exento, a.estatus, a.observacion, a.relacionado , a.numerointerno ";
        const from = " from t_registros a, t_tipodocumentos b, t_serviciosmasivos c ";
        let where = " where a.idtipodocumento = b.id and a.idserviciosmasivo = c.id ";
         where += " and a.idserviciosmasivo = " + idserviciosmasivo + " and a.numerodocumento = '" + numerodocumento + "' "
        const resp = await pool.query(sql + from + where);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Buscando Facturas' + e);
    }
}
export async function getImpProcesados (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;

        let sql = "select COUNT (*) AS total, SUM (a.impuestog) AS totalg, SUM (a.impuestor) AS totalr, SUM ( a.impuestoigtf) AS totaligtf , SUM ( a.exento) AS totalexento, ";
        sql += " SUM (a.baseg) AS totalbaseg, SUM (a.baser) AS totalbaser, SUM ( a.baseigtf) AS totalbaseigtf ";
        const from = " from t_registros a ";
        let where = " where a.estatus = 1 ";
        
        if(idcodigocomercial) {
            where += " and a.idserviciosmasivo in (select id from t_serviciosmasivos where idcodigocomercial = " + idcodigocomercial + ") ";
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(desde.length > 0 && hasta.length > 0) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        let totalg_cred = 0
        let totalr_cred = 0
        let totaligtf_cred = 0
        let totalbaseg_cred = 0
        let totalbaser_cred = 0
        let totalbaseigtf_cred = 0
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        } else {
            const whereold = where

            where += " and (a.idtipodocumento = 1 or a.idtipodocumento = 2 ) ";
            
            const wherecredito = whereold + " and a.idtipodocumento = 3 ";
            const respcredito = await pool.query(sql + from + wherecredito);
            // console.log('respcredito.rows')
            // console.log(respcredito.rows)
            totalg_cred = respcredito.rows[0].totalg
            totalr_cred = respcredito.rows[0].totalr
            totaligtf_cred = respcredito.rows[0].totaligtf
            totalbaseg_cred = respcredito.rows[0].totalbaseg
            totalbaser_cred = respcredito.rows[0].totalbaser
            totalbaseigtf_cred = respcredito.rows[0].totalbaseigtf
        }
        // console.log('sql + from + where')
        // console.log(sql + from + where)
        const resp = await pool.query(sql + from + where);
        // console.log('resp.rows antes')
        // console.log(resp.rows)
        resp.rows[0].totalg = resp.rows[0].totalg - totalg_cred
        resp.rows[0].totalr = resp.rows[0].totalr - totalr_cred
        resp.rows[0].totaligtf = resp.rows[0].totaligtf - totaligtf_cred
        resp.rows[0].totalbaseg = resp.rows[0].totalbaseg - totalbaseg_cred
        resp.rows[0].totalbaser = resp.rows[0].totalbaser - totalbaser_cred
        resp.rows[0].totalbaseigtf = resp.rows[0].totalbaseigtf - totalbaseigtf_cred
        // console.log('resp.rows despues')
        // console.log(resp.rows)
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte' + e);
    }
}
export async function getAnulados (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;

        let sql = "select COUNT (*) AS totalanu ";
        const from = " from t_registros a ";
        let where = " where (a.estatus = 2 or a.idtipodocumento = 3) ";
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        }
        if(idcodigocomercial) {
            where += " and a.idserviciosmasivo in (select id from t_serviciosmasivos where idcodigocomercial = " + idcodigocomercial + ") ";
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        }
        /* if(desde.length > 0 && hasta.length > 0) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        } */
        const resp = await pool.query(sql + from + where);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte anulados' + e);
    }
}
export async function getTotalClientes (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, desde, hasta } = req.body;

        const sql = "select COUNT (*) total , a.idserviciosmasivo  ";
        const from = " from t_registros a ";
        let where = " where a.idserviciosmasivo > 0 ";     
        const groupBy = " GROUP BY a.idserviciosmasivo";
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(desde.length > 0 && hasta.length > 0) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        const resp = await pool.query(sql + from + where + groupBy);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte' + e);
    }
}
export async function getTopClientes (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;

        const sql = "select COUNT (*) total, a.idserviciosmasivo, c.razonsocial, c.rif, SUM (a.impuestog) AS totalg, SUM (a.impuestor) AS totalr, SUM ( a.impuestoigtf) AS totaligtf ";
        const from = " from t_registros a, t_serviciosmasivos c ";
        let where = " where a.idserviciosmasivo = c.id ";     
        const groupBy = " GROUP BY a.idserviciosmasivo, c.razonsocial, c.rif ORDER BY totalg desc limit 5";
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        } 
        if(idcodigocomercial) {
            where += " and c.idcodigocomercial = " + idcodigocomercial;
        }
        if(desde.length > 0 && hasta.length > 0) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        // console.log(sql + from + where + groupBy)
        const resp = await pool.query(sql + from + where + groupBy);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte' + e);
    }
}

export async function getGrafica (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;
        // const annio = moment().format('YYYY')
        const annio = '2023'

        const sql = "SELECT distinct EXTRACT(MONTH FROM a.fecha) as mes, count(a.id) as total";
        const from = " FROM t_registros a, t_serviciosmasivos c  ";
        let where = " where a.idserviciosmasivo = c.id AND EXTRACT(YEAR FROM a.fecha) = '" + annio + "'  ";     
        const groupBy = " group by 1 ORDER BY 1 ASC ";
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        }
        if(idserviciosmasivo > 0) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        } 
        if(idcodigocomercial) {
            where += " and c.idcodigocomercial = " + idcodigocomercial;
        }
        // console.log(sql + from + where + groupBy)
        const resp = await pool.query(sql + from + where + groupBy);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte GRAFICA' + e);
    }
}
export async function getGrafica_BK (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;
        const annio = moment().format('YYYY')
        const sql = "SELECT distinct EXTRACT(MONTH FROM a.fecha) as mes, sum(a.impuestog) as totaliva, sum(a.impuestor) as totalr, sum(a.impuestoigtf) as totaligtf";
        const from = " FROM t_registros a, t_serviciosmasivos c  ";
        let where = " where a.idserviciosmasivo = c.id AND EXTRACT(YEAR FROM a.fecha) = '" + annio + "'  ";     
        const groupBy = " group by 1 ORDER BY 1 ASC ";
        if(idtipodocumento) {
            where += " and a.idtipodocumento = " + idtipodocumento;
        }
        if(idserviciosmasivo) {
            where += " and a.idserviciosmasivo = " + idserviciosmasivo;
        } 
        if(idcodigocomercial) {
            where += " and c.idcodigocomercial = " + idcodigocomercial;
        }
        // console.log(sql + from + where + groupBy)
        const resp = await pool.query(sql + from + where + groupBy);
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte GRAFICA' + e);
    }
}
export async function getDocProcesados (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;

        let sql = "SELECT a.id, a.tipodocumento, ";
        sql += " (select COUNT (*) from t_registros b where b.idtipodocumento = a.id ";
        if(idserviciosmasivo) {
            sql += " and b.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(desde.length > 0 && hasta.length > 0) {
            sql += " and b.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        sql += " and b.estatus = 1 ) AS totaldoc,  ";

        sql += " (select SUM (b.impuestog) from t_registros b where b.idtipodocumento = a.id ";
        if(idserviciosmasivo) {
            sql += " and b.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(desde.length > 0 && hasta.length > 0) {
            sql += " and b.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        sql += " and b.estatus = 1 ) AS sumadocg,  ";

        sql += " (select SUM (b.impuestoigtf) from t_registros b where b.idtipodocumento = a.id ";
        if(idserviciosmasivo) {
            sql += " and b.idserviciosmasivo = " + idserviciosmasivo;
        }
        if(desde.length > 0 && hasta.length > 0) {
            sql += " and b.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        }
        sql += " and b.estatus = 1 ) AS sumadocigtf ";
        const from = " from t_tipodocumentos a ";
        
        // console.log(sql + from )
        const resp = await pool.query(sql + from);        
        // console.log('resp.rows despues')
        // console.log(resp.rows)
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte' + e);
    }
}
export async function getUltimaSemana (req: Request, res: Response): Promise<Response | void> {
    try {
        const { idtipodocumento, idserviciosmasivo, idcodigocomercial, desde, hasta } = req.body;
        const hoy = moment().format('YYYY-MM-DD')
        const hace1dia = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const hace2dia = moment().subtract(2, 'days').format('YYYY-MM-DD')
        const hace3dia = moment().subtract(3, 'days').format('YYYY-MM-DD')
        const hace4dia = moment().subtract(4, 'days').format('YYYY-MM-DD')
        const hace5dia = moment().subtract(5, 'days').format('YYYY-MM-DD')
        const hace6dia = moment().subtract(6, 'days').format('YYYY-MM-DD')
        
        let sql = "SELECT a.id, a.razonsocial, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $1 ) AS hoy, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $2 ) AS hace1dia, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $3 ) AS hace2dia, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $4 ) AS hace3dia, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $5 ) AS hace4dia, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $6 ) AS hace5dia, ";
        sql += " (select count (*) from t_registros b where b.idserviciosmasivo = a.id and b.estatus = 1 and to_char(b.fecha, 'YYYY-MM-DD') = $7 ) AS hace6dia ";
        const from = " from t_serviciosmasivos a ";

        let where = " where a.estatus = 1 ";
        if(idserviciosmasivo) {
            where += " and a.id = " + idserviciosmasivo;
        }
        /* if(idcodigocomercial) {
            where += " and a.idserviciosmasivo in (select id from t_serviciosmasivos where idcodigocomercial = " + idcodigocomercial + ") ";
        }
        
        if(desde.length > 0 && hasta.length > 0) {
            where += " and a.fecha BETWEEN '" + desde + "'::timestamp AND '" + hasta + " 23:59:59'::timestamp ";
        } */
        const orderby = " order by a.id ";
        // console.log(sql + from + where + orderby)
        const resp = await pool.query(sql + from + where + orderby,[hoy, hace1dia, hace2dia, hace3dia, hace4dia, hace5dia, hace6dia]);        
        // console.log('resp.rows despues')
        // console.log(resp.rows)
        const data = {
            succes: true,
            data: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Reporte' + e);
    }
}
