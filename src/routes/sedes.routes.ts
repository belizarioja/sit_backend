import { Router } from 'express';
import { getSedes, setSede, updateSede, updateEstatus, getSedeCorelativo, getCodes } from '../controllers/sedes.controller';

const router = Router();

router.route('/')
    .get(getSedes)
    .post(setSede)
router.route('/codes')
    .get(getCodes)
    
    router.route('/:id')
    .get(getSedeCorelativo)
    .put(updateSede)

    router.route('/estatus/:id')
    .put(updateEstatus)
        
export default router;