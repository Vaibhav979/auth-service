import Router from 'express';

import * as healthController from './health.controller';

const router = Router();

router.get('/health', healthController.getHealthStatus);
router.get('/health/database', healthController.getDatabaseStatus);

export default router;