import { Request, Response } from 'express';
// import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET = process.env.SECRET || '123456';
// DB
import { pool } from '../database'

export async function getLogin (req: Request, res: Response): Promise<Response | void> {
    try {
        const { usuario, clave } = req.body;
        const sql = "select a.id, a.idrol, a.idserviciosmasivo, a.nombre, c.razonsocial, b.rol, c.rif, a.estatus ";
        const from = " from t_usuarios a ";
        let leftjoin = " left join t_roles b ON a.idrol = b.id  ";
        leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
        const where = " where a.usuario ='" + usuario + "' and a.clave = '" + clave + "'";
        // console.log(sql + from + leftjoin + where);
        const resp = await pool.query(sql + from + leftjoin + where);
        // console.log(resp.rows[0])
        const cant = resp.rows.length;
        if (cant > 0) {
            if(resp.rows[0].estatus === '0') {
                
                const data = {
                    message: "Usuario no autorizado!"
                };
                return res.status(202).json(data);
               
            } else {
               
                const accessToken: string = jwt.sign({ user: resp.rows[0] }, SECRET);
                const data = {
                    message: "Acceso válido",
                    resp: resp.rows[0],
                    accessToken: accessToken
                };
                return res.status(200).json(data);
            }
            
        } else {
            const data = {
                message: "Credenciales Incorrectas!"
            };
            return res.status(202).json(data);
        }
    }
    catch (e) {
        return res.status(400).send('Error Logueando ' + e);
    }
}
export async function getUsuarios (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select a.id, a.idrol, a.usuario, a.clave, a.idserviciosmasivo, a.nombre, c.razonsocial, b.rol, a.estatus ";
        const from = " from t_usuarios a ";
        let leftjoin = " left join t_roles b ON a.idrol = b.id  ";
        leftjoin += " left join t_serviciosmasivos c ON a.idserviciosmasivo = c.id  ";
        const resp = await pool.query(sql + from + leftjoin);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Usuarios ' + e);
    }
}
export async function getRoles (req: Request, res: Response): Promise<Response | void> {
    try {
        const sql = "select * ";
        const from = " from t_roles ";
        const resp = await pool.query(sql + from);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: resp.rows
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Listando Roles ' + e);
    }
}
export async function setUsuarios (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nombre, usuario, clave, idrol, idserviciosmasivo, estatus } = req.body;

        const insert = "insert into t_usuarios (nombre, usuario, clave, idrol, idserviciosmasivo, estatus ) ";
        const values = " values ($1, $2, $3, $4, $5, $6) ";
        const resp = await pool.query(insert + values, [nombre, usuario, clave, idrol, idserviciosmasivo, estatus]);
        const cant = resp.rows.length;
        const data = {
            success: true,
            resp: {
                message: "Usuario creado con éxito"
            }
        };
        return res.status(200).json(data);        
    }
    catch (e) {
        return res.status(400).send('Error Ingesando Usuario ' + e);
    }
}
export async function updateEstatus (req: Request, res: Response): Promise<Response | void> {
    try {
        const { estatus } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_usuarios set estatus = $1 where id = $2 ";
        await pool.query(sqlupd, [estatus, id])
        const data = {
            success: true,
            resp: {
                message: "Estatus de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Estatus de Usuarios ' + e);
    }
}
export async function updateClave (req: Request, res: Response): Promise<Response | void> {
    try {
        const { nuevaclave } = req.body;
        const { id } = req.params;       

        const sqlupd = "update t_usuarios set clave = $1 where id = $2 ";
        await pool.query(sqlupd, [nuevaclave, id])
        const data = {
            success: true,
            resp: {
                message: "Clave de Usuario actualizado con éxito"
            }
        };
        return res.status(200).json(data);
        
    }
    catch (e) {
        return res.status(400).send('Error Actualizando Clave de Usuarios ' + e);
    }
}