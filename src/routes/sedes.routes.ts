import { Router } from 'express';
import { getSedes, setSede, updateSede, updateEstatus, getSedeCorelativo, getCodes, getTodosCorelativo, getSede } from '../controllers/sedes.controller';

const router = Router();

router.route('/')
    .get(getSedes)
    .post(setSede)
    
router.route('/buscarid').post(getSede)
router.route('/codes').get(getCodes)
router.route('/lotes').post(getTodosCorelativo)
    
router.route('/:id')
    .get(getSedeCorelativo)
    .put(updateSede)

router.route('/estatus/:id').put(updateEstatus)
        
export default router;