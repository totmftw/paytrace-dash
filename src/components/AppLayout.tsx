import React from 'react';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div>
            <header>
                <h1>App Header</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>App Footer</p>
            </footer>
        </div>
    );
};

export default AppLayout;
