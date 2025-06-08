import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError("");
      setLoading(true);
      
      // First attempt login without PIN
      const user = await signIn(email, password);
      
      // If user has PIN, prompt for it
      if (user.pin) {
        onOpen();
      } else {
        // No PIN required, proceed to dashboard
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    try {
      setError("");
      setLoading(true);
      
      // Verify with PIN
      await signIn(email, password, pin);
      
      // Navigate to dashboard on success
      navigate("/dashboard");
    } catch (err: any) {
      console.error("PIN verification error:", err);
      setError(err.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <Icon icon="lucide:file-text" className="text-primary" width={40} height={40} />
          <h1 className="text-2xl font-semibold">Billing & Invoicing System</h1>
          <p className="text-foreground-500">Sign in to your account</p>
        </CardHeader>
        
        <CardBody className="py-5">
          {error && (
            <div className="bg-danger-50 text-danger border border-danger rounded-medium p-3 mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              isRequired
              startContent={<Icon icon="lucide:mail" className="text-default-400" width={16} />}
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              isRequired
              startContent={<Icon icon="lucide:lock" className="text-default-400" width={16} />}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                color="primary" 
                fullWidth
                isLoading={loading}
              >
                Sign In
              </Button>
            </div>
          </form>
          
          <Divider className="my-4" />
          
          <div className="text-center text-small text-foreground-500">
            <p>For demo purposes:</p>
            <p>Admin: admin@example.com / password123</p>
            <p>Staff: staff@example.com / password123</p>
          </div>
        </CardBody>
      </Card>
      
      {/* PIN Verification Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        hideCloseButton
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Security Verification
          </ModalHeader>
          <ModalBody>
            <p className="text-foreground-600 mb-2">
              Please enter your security PIN to continue.
            </p>
            <Input
              type="password"
              label="PIN"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              startContent={<Icon icon="lucide:key" className="text-default-400" width={16} />}
            />
            {error && (
              <p className="text-danger text-small mt-2">{error}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onPress={handlePinSubmit}
              isLoading={loading}
              fullWidth
            >
              Verify
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};