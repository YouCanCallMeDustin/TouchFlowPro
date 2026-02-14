import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Billing route' });
});

export default router;
