import { Router } from 'express';
import { getFacturas, getImpProcesados, getTopClientes, getTotalClientes, getFacturaNum, getFacturaDet, getAnulados, getGrafica, getDocProcesados, getUltimaSemana } from '../controllers/reportes.controller';

const router = Router();

router.route('/facturas/relacionado')
    .post(getFacturaNum)
router.route('/facturas/detalles/:id')
    .get(getFacturaDet)
router.route('/facturas')
    .post(getFacturas)
router.route('/impprocesados')
    .post(getImpProcesados)
router.route('/anulados')
    .post(getAnulados)
router.route('/topclientes')
    .post(getTopClientes)
router.route('/totalclientes')
    .post(getTotalClientes)
router.route('/grafica')
    .post(getGrafica)
router.route('/totaldocumentos')
    .post(getDocProcesados)
router.route('/ultimasemana')
    .post(getUltimaSemana)

export default router;