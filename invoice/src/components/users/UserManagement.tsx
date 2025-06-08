import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth, User, UserRole } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";

const userPermissions = {
  admin: [
    "view:dashboard", "create:invoice", "view:invoices", "edit:invoice", "delete:invoice",
    "view:customers", "create:customer", "edit:customer", "delete:customer",
    "view:analytics", "view:settings", "edit:settings", "manage:users"
  ],
  manager: [
    "view:dashboard", "create:invoice", "view:invoices", "edit:invoice",
    "view:customers", "create:customer", "edit:customer",
    "view:analytics", "view:settings"
  ],
  accountant: [
    "view:dashboard", "create:invoice", "view:invoices", "edit:invoice",
    "view:customers", "view:analytics"
  ],
  staff: [
    "view:dashboard", "create:invoice", "view:invoices",
    "view:customers"
  ]
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [newUser, setNewUser] = React.useState({
    email: "",
    displayName: "",
    password: "",
    pin: "",
    role: "staff" as UserRole,
    department: "",
    permissions: [...userPermissions.staff]
  });
  
  const { currentUser, getUsersByRole, createUser, updateUserRole } = useAuth();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
  
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        
        // Get users of all roles
        const adminUsers = await getUsersByRole("admin");
        const managerUsers = await getUsersByRole("manager");
        const accountantUsers = await getUsersByRole("accountant");
        const staffUsers = await getUsersByRole("staff");
        
        setUsers([...adminUsers, ...managerUsers, ...accountantUsers, ...staffUsers]);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [getUsersByRole]);
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onEditOpen();
  };
  
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { ...user, role: newRole } : user
        )
      );
      
      // If editing the selected user, update that too
      if (selectedUser && selectedUser.uid === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };
  
  const handleCreateUser = async () => {
    try {
      const userData = {
        displayName: newUser.displayName,
        role: newUser.role,
        department: newUser.department,
        permissions: newUser.permissions,
        pin: newUser.pin
      };
      
      const createdUser = await createUser(newUser.email, newUser.password, userData);
      
      // Add to local state
      setUsers(prev => [...prev, createdUser]);
      
      // Reset form and close modal
      setNewUser({
        email: "",
        displayName: "",
        password: "",
        pin: "",
        role: "staff",
        department: "",
        permissions: [...userPermissions.staff]
      });
      
      onCreateOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  
  const handleRoleSelect = (role: UserRole) => {
    setNewUser({
      ...newUser,
      role,
      permissions: [...userPermissions[role]]
    });
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "manager":
        return "primary";
      case "accountant":
        return "success";
      default:
        return "default";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">User Management</h1>
        <Button 
          color="primary" 
          startContent={<Icon icon="lucide:user-plus" width={16} />}
          onPress={onCreateOpen}
        >
          Add User
        </Button>
      </div>
      
      <Card>
        <CardBody className="p-0">
          <Table 
            aria-label="Users table"
            removeWrapper
            classNames={{
              th: "bg-content2",
            }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>LAST LOGIN</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody 
              isLoading={loading}
              loadingContent="Loading users..."
              emptyContent="No users found"
            >
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      color={getRoleBadgeColor(user.role)} 
                      variant="flat"
                      size="sm"
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Chip>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditUser(user)}
                        isDisabled={user.uid === currentUser?.uid} // Can't edit self
                      >
                        <Icon icon="lucide:edit" width={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      
      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit User
              </ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Name"
                        value={selectedUser.displayName}
                        isReadOnly
                      />
                      <Input
                        label="Email"
                        value={selectedUser.email}
                        isReadOnly
                      />
                      <Select
                        label="Role"
                        selectedKeys={[selectedUser.role]}
                        onChange={(e) => handleRoleChange(selectedUser.uid, e.target.value as UserRole)}
                      >
                        <SelectItem key="admin" value="admin">Admin</SelectItem>
                        <SelectItem key="manager" value="manager">Manager</SelectItem>
                        <SelectItem key="accountant" value="accountant">Accountant</SelectItem>
                        <SelectItem key="staff" value="staff">Staff</SelectItem>
                      </Select>
                      <Input
                        label="Department"
                        value={selectedUser.department || ""}
                        isReadOnly
                      />
                    </div>
                    
                    <Divider />
                    
                    <div>
                      <h3 className="text-medium font-semibold mb-2">Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedUser.permissions.map((permission) => (
                          <Chip key={permission} variant="flat" size="sm">
                            {permission}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New User
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      placeholder="Enter user's name"
                      value={newUser.displayName}
                      onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter user's email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      isRequired
                    />
                    <Input
                      label="Security PIN (optional)"
                      type="password"
                      placeholder="4-digit PIN"
                      maxLength={4}
                      value={newUser.pin}
                      onChange={(e) => setNewUser({...newUser, pin: e.target.value})}
                    />
                    <Select
                      label="Role"
                      selectedKeys={[newUser.role]}
                      onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
                    >
                      <SelectItem key="admin" value="admin">Admin</SelectItem>
                      <SelectItem key="manager" value="manager">Manager</SelectItem>
                      <SelectItem key="accountant" value="accountant">Accountant</SelectItem>
                      <SelectItem key="staff" value="staff">Staff</SelectItem>
                    </Select>
                    <Input
                      label="Department"
                      placeholder="Enter department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    />
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="text-medium font-semibold mb-2">Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {newUser.permissions.map((permission) => (
                        <Chip key={permission} variant="flat" size="sm">
                          {permission}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateUser}>
                  Create User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};