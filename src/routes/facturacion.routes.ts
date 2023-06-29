import { Router } from 'express';
import { setFacturacion } from '../controllers/facturacion.controller';
import { verifyTokenFactura } from '../lib/verifyTokenFactura'


const router = Router();

router.route('/').post(verifyTokenFactura, setFacturacion)

export default router;