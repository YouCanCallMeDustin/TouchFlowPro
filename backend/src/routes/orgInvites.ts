import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Org Invites route' });
});

export default router;
