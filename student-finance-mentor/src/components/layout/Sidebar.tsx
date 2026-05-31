import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Divider, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile = false }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { progress, lessons } = useData();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const userId = currentUser?.uid || "student1";
  const userProgress = progress[userId] || { completedLessons: [] };
  const completedLessonsCount = userProgress.completedLessons.length;
  const showLessonsBadge = completedLessonsCount > 0 && completedLessonsCount < lessons.length;

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      icon: "lucide:layout-dashboard",
      path: "/"
    },
    {
      label: "Budget",
      icon: "lucide:wallet",
      path: "/budget"
    },
    {
      label: "Simulate",
      icon: "lucide:calculator",
      path: "/simulate"
    },
    {
      label: "Loans",
      icon: "lucide:trending-up",
      path: "/loans"
    },
    {
      label: "Lessons",
      icon: "lucide:book-open",
      path: "/lessons",
      badge: showLessonsBadge ? `${completedLessonsCount}/${lessons.length}` : null
    },
    {
      label: "Admin Dashboard",
      icon: "lucide:settings",
      path: "/admin",
      adminOnly: true
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== "admin") {
      return false;
    }
    return true;
  });

  if (isMobile) {
    return (
      <nav className="flex justify-around items-center p-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-lg ${isActive(item.path) ? "text-primary bg-primary-50" : "text-foreground-500"}`}
          >
            <Badge content={item.badge} color="primary" isInvisible={!item.badge} size="sm">
              <Icon icon={item.icon} width={24} height={24} />
            </Badge>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <aside
      className={`bg-content1 border-r border-divider transition-all duration-300 h-full ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col`}
    >
      <div className="p-4 flex flex-col items-center justify-center relative">
        <div className="absolute top-4 right-4" title={isOnline ? "Online" : "Offline"}>
          <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-success" : "bg-danger"}`}></div>
        </div>
        <Icon
          icon="lucide:graduation-cap"
          className="text-primary"
          width={isOpen ? 32 : 24}
          height={isOpen ? 32 : 24}
        />
        {isOpen && (
          <span className="ml-2 mt-2 font-semibold text-lg text-center leading-tight">Student Finance<br/>Mentor</span>
        )}
      </div>

      <Divider />

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col gap-2 px-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-foreground-600 hover:text-foreground"
            >
              <Badge content={item.badge} color="primary" isInvisible={!item.badge} placement="top-right" size="sm" className="right-4">
                <Button
                  variant={isActive(item.path) ? "flat" : "light"}
                  color={isActive(item.path) ? "primary" : "default"}
                  className={`justify-start w-full h-12 ${isOpen ? "px-4" : "justify-center px-0"}`}
                  startContent={
                    <Icon
                      icon={item.icon}
                      width={20}
                      height={20}
                    />
                  }
                >
                  {isOpen && <span className="flex-1 text-left">{item.label}</span>}
                </Button>
              </Badge>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <div className="bg-content2 rounded-medium p-3 relative">
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
