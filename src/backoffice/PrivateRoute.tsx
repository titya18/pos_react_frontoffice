import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";

interface PrivateRouteProps {
    element: React.ReactElement;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('PrivateRoute must be used within an AppContextProvider');
    }

    const { isLoggedIn } = context;

    return isLoggedIn ? element : <Navigate to="/admin/signIn" replace />;
};

export default PrivateRoute;