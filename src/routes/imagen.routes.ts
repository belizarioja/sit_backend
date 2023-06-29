import { Router } from 'express';
import { getImagen, setImagen } from '../controllers/imagen.controller';
import multer from 'multer';
const upload = multer({ dest: __dirname + '/images/'});

const router = Router();

router.route('/:img').get(getImagen)
router.route('/uploadimg/:rif').post(setImagen, upload.array("files"))

export default router;