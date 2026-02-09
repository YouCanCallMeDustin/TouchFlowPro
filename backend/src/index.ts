import 'dotenv/config';
import 'tsconfig-paths/register';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`TouchFlow Pro server running on port ${PORT}`);
});
