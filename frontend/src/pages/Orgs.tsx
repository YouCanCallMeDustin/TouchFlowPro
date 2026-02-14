import React from 'react';

interface OrgsProps {
    userId: string;
}

const Orgs: React.FC<OrgsProps> = ({ userId: _userId }) => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Organizations</h1>
            <p>Manage your organizations here.</p>
        </div>
    );
};

export default Orgs;
