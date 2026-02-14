import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Orgs route' });
});

export default router;
