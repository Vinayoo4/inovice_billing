import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { currentUser, hasPermission } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      label: "Dashboard",
      icon: "lucide:layout-dashboard",
      path: "/dashboard",
      permission: "view:dashboard"
    },
    {
      label: "Create Invoice",
      icon: "lucide:file-plus",
      path: "/invoices/create",
      permission: "create:invoice"
    },
    {
      label: "Invoices",
      icon: "lucide:files",
      path: "/invoices",
      permission: "view:invoices"
    },
    {
      label: "Customers",
      icon: "lucide:users",
      path: "/customers",
      permission: "view:customers"
    },
    {
      label: "Analytics",
      icon: "lucide:bar-chart-2",
      path: "/analytics",
      permission: "view:analytics"
    },
    {
      label: "User Management",
      icon: "lucide:user-cog",
      path: "/users",
      permission: "manage:users",
      adminOnly: true
    },
    {
      label: "Settings",
      icon: "lucide:settings",
      path: "/settings",
      permission: "view:settings"
    }
  ];
  
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== "admin") {
      return false;
    }
    return hasPermission(item.permission);
  });
  
  return (
    <aside 
      className={`bg-content1 border-r border-divider transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col`}
    >
      <div className="p-4 flex items-center justify-center">
        <Icon 
          icon="lucide:file-text" 
          className="text-primary" 
          width={isOpen ? 32 : 24} 
          height={isOpen ? 32 : 24} 
        />
        {isOpen && (
          <span className="ml-2 font-semibold text-lg">Billing System</span>
        )}
      </div>
      
      <Divider />
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          {filteredNavItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="text-foreground-600 hover:text-foreground"
            >
              <Button
                variant={isActive(item.path) ? "flat" : "light"}
                color={isActive(item.path) ? "primary" : "default"}
                className={`justify-start w-full ${isOpen ? "" : "justify-center"}`}
                startContent={
                  <Icon 
                    icon={item.icon} 
                    width={20} 
                    height={20} 
                  />
                }
              >
                {isOpen && item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4">
        <div className="bg-content2 rounded-medium p-3">
          {isOpen ? (
            <div className="text-center">
              <p className="text-tiny text-foreground-500">Logged in as</p>
              <p className="font-semibold">{currentUser?.displayName}</p>
              <p className="text-tiny capitalize text-foreground-500">{currentUser?.role}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Icon icon="lucide:user" width={20} height={20} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};