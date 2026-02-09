import 'dotenv/config';
import app from './app';

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`TouchFlow Pro server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
