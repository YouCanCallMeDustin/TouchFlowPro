import 'dotenv/config';
import app from './app';
import recommendationsRouter from './routes/recommendations';

app.use('/api/recommendations', recommendationsRouter);

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
