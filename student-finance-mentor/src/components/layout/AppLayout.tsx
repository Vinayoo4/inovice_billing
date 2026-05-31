import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { InstallPrompt } from "../pwa/InstallPrompt";
import { UpdateBanner } from "../pwa/UpdateBanner";

export const AppLayout: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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
    if (path.includes("/budget")) return "My Budget";
    if (path.includes("/loans")) return "Loan Scenarios";
    if (path.includes("/lessons")) return "Financial Lessons";
    if (path.includes("/admin")) return "Admin Dashboard";
    return "Student Finance Mentor";
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
        <div className="hidden md:block h-full">
          <Sidebar isOpen={isSidebarOpen} />
        </div>

        <main className="flex-1 overflow-auto p-4 relative pb-20 md:pb-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-content1 border-t border-divider z-40">
        <Sidebar isOpen={true} isMobile={true} />
      </div>

      <InstallPrompt />
      <UpdateBanner />
    </div>
  );
};
