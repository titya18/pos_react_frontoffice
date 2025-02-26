import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppContextProvider } from "../contexts/AppContext";
import PrivateRoute from "./PrivateRoute";
import Layout from "./layouts/Layout";
{/* Sign-In and Sign-Up */}
import SignUp from "./pages/signup/SignUp";
import SignIn from "./pages/signin/SignIn";

{/* Dashboard */}
import Dashboard from "./pages/dashboard/Dashboard";

{/* Role and Permission */}
import ModulePermission from "./pages/module_permission/ModulePermission";
import Role from "./pages/role/Role";
import AddRole from "./pages/role/AddRole";
import EditRole from "./pages/role/EditRole";

{/* User */}
import User from "./pages/user/User";
import UserForm from "./pages/user/UserForm";

{/* Branch */}
import Branch from "./pages/branch/Branch";

// Payment Method
import PaymentMethod from "./pages/paymentmethod/PaymentMethod";
// Category
import Category from "./pages/category/Category";
// Unit
import Unit from "./pages/unit/Unit";
// Brand
import Brand from "./pages/brand/Brand";
// Product
import Product from "./pages/product/Product";
// Product Variant
import ProductVariant from "./pages/product_variant/ProductVariant";
// Supplier
import Supplier from "./pages/supplier/Supplier";
// Purchase
import Purchase from "./pages/purchase/Purchase";
import PurchaseForm from "./pages/purchase/PurchaseForm";
import PrintPurchase from "./pages/purchase/PrintPurchase";


import NotFound from "./pages/notfound/NotFount";

const App: React.FC = () => {
    return (
        <Router>
            <AppContextProvider>
                <Routes>
                    {/* Sign-In and Sign-Up */}
                    <Route path="/admin/signup" element={<SignUp />} />
                    <Route path="/admin/signin" element={<SignIn />} />

                    {/* Dashboard */}
                    <Route path="/admin/dashboard" element={<PrivateRoute element={<Layout><Dashboard /></Layout>} />} />

                    {/* Role and Permission */}
                    <Route path="/admin/modulepermission" element={<PrivateRoute element={<Layout><ModulePermission /></Layout>} />} />
                    <Route path="/admin/role" element={<PrivateRoute element={<Layout><Role /></Layout>} />} />
                    <Route path="/admin/addrole" element={<PrivateRoute element={<Layout><AddRole /></Layout>} />} />
                    <Route path="/admin/editrole/:id" element={<PrivateRoute element={<Layout><EditRole /></Layout>} />} />

                    {/* User */}
                    <Route path="/admin/user" element={<PrivateRoute element={<Layout><User /></Layout>} />} />
                    <Route path="/admin/adduser" element={<PrivateRoute element={<Layout><UserForm /></Layout>} />} />
                    <Route path="/admin/edituser/:id" element={<PrivateRoute element={<Layout><UserForm /></Layout>} />} />

                    {/* Branch */}
                    <Route path="/admin/branches" element={<PrivateRoute element={<Layout><Branch /></Layout>} />} />

                    {/* Payment Method */}
                    <Route path="/admin/paymentmethod" element={<PrivateRoute element={<Layout><PaymentMethod /></Layout>} />} />
                    {/* Category */}
                    <Route path="/admin/categories" element={<PrivateRoute element={<Layout><Category /></Layout>} />} />
                    {/* Unit */}
                    <Route path="/admin/units" element={<PrivateRoute element={<Layout><Unit /></Layout>} />} />
                    {/* Brand */}
                    <Route path="/admin/brands" element={<PrivateRoute element={<Layout><Brand /></Layout>} />} />
                    {/* Product */}
                    <Route path="/admin/products" element={<PrivateRoute element={<Layout><Product /></Layout>} />} />
                    {/* Product Variant */}
                    <Route path="/admin/productvariant/:id" element={<PrivateRoute element={<Layout><ProductVariant /></Layout>} />} />
                    {/* Product */}
                    <Route path="/admin/supplier" element={<PrivateRoute element={<Layout><Supplier /></Layout>} />} />
                    {/* Purchase */}
                    <Route path="/admin/purchase" element={<PrivateRoute element={<Layout><Purchase /></Layout>} />} />
                    <Route path="/admin/addpurchase" element={<PrivateRoute element={<Layout><PurchaseForm /></Layout>} />} />
                    <Route path="/admin/editpurchase/:id" element={<PrivateRoute element={<Layout><PurchaseForm /></Layout>} />} />
                    <Route path="/admin/printpurchase/:id" element={<PrivateRoute element={<Layout><PrintPurchase /></Layout>} />} />

                    {/* Catch-all route for undefined paths */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppContextProvider>
        </Router>
    );
};

export default App;