import React from "react";
import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData } from "../../context/DataContext";

interface ActivityFeedProps {
  onClose: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ onClose }) => {
  const { activityLog } = useData();
  
  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "invoice":
        return "lucide:file-text";
      case "customer":
        return "lucide:user";
      case "user":
        return "lucide:user-cog";
      default:
        return "lucide:activity";
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "text-success";
      case "update":
        return "text-primary";
      case "delete":
        return "text-danger";
      default:
        return "text-foreground";
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-divider">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <Button isIconOnly variant="light" onPress={onClose}>
          <Icon icon="lucide:x" width={18} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activityLog.length === 0 ? (
          <div className="text-center py-8 text-foreground-500">
            <Icon icon="lucide:activity" className="mx-auto mb-2" width={32} />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityLog.map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className={`rounded-full p-2 bg-content2 ${getActionColor(log.action)}`}>
                  <Icon icon={getActivityIcon(log.entityType)} width={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{log.userName}</p>
                    <span className="text-tiny text-foreground-500">{formatTime(log.timestamp)}</span>
                  </div>
                  <p className="text-small text-foreground-600">
                    <span className={`font-medium ${getActionColor(log.action)}`}>
                      {log.action}d
                    </span>
                    {" "}
                    {log.entityType === "invoice" && "invoice "}
                    {log.entityType === "customer" && "customer "}
                    {log.entityType === "user" && "user "}
                    {log.details?.invoiceNumber && `#${log.details.invoiceNumber}`}
                    {log.details?.customerName && log.details.customerName}
                    {log.details?.userName && log.details.userName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};