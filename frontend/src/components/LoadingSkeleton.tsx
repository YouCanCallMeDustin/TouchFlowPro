import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton width={300} height={40} />
                <div className="flex gap-2">
                    <Skeleton width={80} height={40} />
                    <Skeleton width={80} height={40} />
                    <Skeleton width={80} height={40} />
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                        <Skeleton width={100} height={12} className="mb-3" />
                        <Skeleton width={120} height={36} />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <Skeleton width={200} height={24} className="mb-6" />
                <Skeleton height={300} />
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <Skeleton width={200} height={24} className="mb-6" />
                <Skeleton height={300} />
            </div>
        </div>
    );
};

export default LoadingSkeleton;
