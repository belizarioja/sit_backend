import { Router } from 'express';
import { getFactura, getUtils } from '../controllers/archivos.controller';

const router = Router();

router.route('/:rif/:anniomes/:rifid').get(getFactura)
router.route('/utils/:img').get(getUtils)

export default router;