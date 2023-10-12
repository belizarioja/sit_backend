import { Request, Response } from 'express';
import fs from 'fs';
  
export async function getFactura (req: Request, res: Response): Promise<Response | void> {
    try {
        const rifid = req.params.rifid
        const rif = req.params.rif
        const anniomes = req.params.anniomes
        // console.log(__dirname)
        const path = __dirname + '/temp/' + rif + '/' + anniomes + '/' + rifid + '.pdf'
        console.log(path)
        if (fs.existsSync(path)) {
            fs.readFile(path , function (err, data){
                res.contentType("application/pdf");
                res.send(data);
            });
        } else {
        return res.status(202).send({ message: 'Archivo no encontrado!' })
        }
    }
    catch (e) {
        return res.status(400).send('Error buscando archivo pdf Documento ' + e);
    }
}
  

export async function getUtils (req: Request, res: Response): Promise<Response | void> {
    try {
        const img = req.params.img
        const path = __dirname + '/utils/' + img
        if (fs.existsSync(path)) {
        // const imgbase64 = fs.readFileSync(path, { encoding: 'base64' })
        return res.sendFile(path)
        // return res.status(200).send({ imgbase64, message: 'Imagen encontrada!' })
        } else {
        return res.status(202).send({ message: 'Imagen de formato de correo no encontrada!' })
        }
    }
    catch (e) {
        return res.status(400).send('Error Enviando imagen de formato de correo ' + e);
    }
}
  

