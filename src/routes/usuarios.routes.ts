import { Router } from 'express';
import { getUsuarios, setUsuarios, getLogin, getRoles, updateEstatus, updateClave } from '../controllers/usuarios.controller';

const router = Router();

router.route('/')
    .get(getUsuarios)
router.route('/')
    .post(setUsuarios)
router.route('/login')
    .post(getLogin)
router.route('/roles')
    .get(getRoles)
router.route('/estatus/:id')
        .put(updateEstatus)
router.route('/cambioclave/:id')
        .put(updateClave)
        
export default router;