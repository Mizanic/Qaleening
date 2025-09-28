import React from "react";
import { useAuth } from "@/stores/authStore";
import AdminLayout from "@/app/private/(admin)/_layout";
import UserLayout from "@/app/private/(user)/_layout";

const PrivateLayout: React.FC = () => {
    const { isAdmin } = useAuth();
    return isAdmin ? <AdminLayout /> : <UserLayout />;
};

export default PrivateLayout;
