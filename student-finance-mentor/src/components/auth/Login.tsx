import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const user = await signIn(email, password);

      if (user.role === 'admin') {
         navigate("/admin");
      } else {
         navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <Icon icon="lucide:graduation-cap" className="text-primary" width={40} height={40} />
          <h1 className="text-2xl font-semibold">Student Finance Mentor</h1>
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

            <div className="text-center mt-2">
              <span className="text-sm">Don't have an account? </span>
              <Button variant="light" color="primary" size="sm" onPress={() => navigate('/register')}>
                Register here
              </Button>
            </div>
          </form>

          <Divider className="my-4" />

          <div className="text-center text-small text-foreground-500">
            <p>Demo accounts (password in seed.json):</p>
            <p>Admin: admin@sfm.com / admin123</p>
            <p>Student: student@sfm.com / student123</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
