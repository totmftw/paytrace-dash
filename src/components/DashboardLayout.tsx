import React from 'react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Dashboard Header</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>Dashboard Footer</p>
            </footer>
        </div>
    );
};

export default DashboardLayout;
