import React from "react";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Link, 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Avatar,
  Badge
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { ActivityFeed } from "../activity/ActivityFeed";

export const AppLayout: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showActivityFeed, setShowActivityFeed] = React.useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/invoices")) return "Invoices";
    if (path.includes("/customers")) return "Customers";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/users")) return "User Management";
    return "Billing & Invoicing System";
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isBordered maxWidth="full">
        <NavbarContent>
          <Button
            isIconOnly
            variant="light"
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Icon icon="lucide:menu" width={20} />
          </Button>
          <NavbarBrand>
            <p className="font-semibold text-inherit">{getPageTitle()}</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button 
              isIconOnly 
              variant="light" 
              onPress={() => setShowActivityFeed(!showActivityFeed)}
            >
              <Badge content={5} color="danger">
                <Icon icon="lucide:bell" width={20} />
              </Badge>
            </Button>
          </NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={currentUser?.displayName || "User"}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem key="profile" textValue="Profile">
                <div className="flex flex-col">
                  <span className="font-semibold">{currentUser?.displayName}</span>
                  <span className="text-tiny text-default-500">{currentUser?.email}</span>
                </div>
              </DropdownItem>
              <DropdownItem key="role" textValue="Role">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield" width={16} />
                  <span className="capitalize">{currentUser?.role}</span>
                </div>
              </DropdownItem>
              <DropdownItem key="settings" onPress={() => navigate("/settings")}>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:settings" width={16} />
                  <span>Settings</span>
                </div>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:log-out" width={16} />
                  <span>Log Out</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        
        {showActivityFeed && (
          <div className="w-80 border-l border-divider overflow-auto">
            <ActivityFeed onClose={() => setShowActivityFeed(false)} />
          </div>
        )}
      </div>
    </div>
  );
};