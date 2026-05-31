import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      const usersStr = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersStr);

      if (users.find((u: any) => u.email === email)) {
        throw new Error("User with this email already exists");
      }

      const newUser = {
        uid: uuidv4(),
        email,
        displayName: name,
        password,
        role: "student",
        permissions: [],
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Successfully registered, send them to login
      navigate("/login");
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.message || "Failed to register");
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
          <p className="text-foreground-500">Create a new account</p>
        </CardHeader>

        <CardBody className="py-5">
          {error && (
            <div className="bg-danger-50 text-danger border border-danger rounded-medium p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              isRequired
              startContent={<Icon icon="lucide:user" className="text-default-400" width={16} />}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@sfm.com"
              isRequired
              startContent={<Icon icon="lucide:mail" className="text-default-400" width={16} />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              isRequired
              startContent={<Icon icon="lucide:lock" className="text-default-400" width={16} />}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
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
                Register
              </Button>
            </div>

            <div className="text-center mt-2">
              <span className="text-sm">Already have an account? </span>
              <Button variant="light" color="primary" size="sm" onPress={() => navigate('/login')}>
                Sign in here
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
