import { Router } from 'express';
import { handleClientRequest } from '@/api/v1/controllers/clientController';

const router = Router();

router.post('/', handleClientRequest);

export default router;
