import { Request, Response } from 'express';
import moment from 'moment';

// DB
import { pool } from '../database'

export async function setAnulacion (req: Request, res: Response): Promise<Response | void> {
    try {
        const { id } = req;
        const { numerodocumento, observacion } = req.body;

        if(numerodocumento.length < 11) {
            return res.status(202).json({
                success: false,            
                data: null,
                error: {
                    code: 2,
                    message: 'Valor de NUMERO DOCUMENTO NO VALIDO!'
                }
            });
        }
        const fechaanulado = moment().format('YYYY-MM-DD HH:mm:ss')

        const sqlupd = " update t_registros set estatus = 2,  observacion = $3, fechaanulado = $4 ";
        const whereupd = " where idserviciosmasivo = $1 AND numerodocumento = $2 ";
        // console.log(sqlupd + whereupd)

        const respupd = await pool.query(sqlupd + whereupd, [id, numerodocumento, observacion, fechaanulado])
        
        if(respupd.rowCount === 1) {
            const data = {
                success: true,
                error: null,
                data: {
                    message: 'Documento ANULADO con éxito!'
                }           
            };
            return res.status(200).json(data);
        } else {
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
}