import { Button, Card, CardBody, Input } from "@nextui-org/react";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiConfig } from "../../config/api";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(apiConfig.endpoints.auth.resetPassword, {
        token,
        new_password: data.password,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-default-50 to-primary-50/20 p-4">
        <div className="w-full max-w-md animate-fade-in-scale">
          <Card className="card-enhanced glass-morphism border border-default-200/50 shadow-2xl backdrop-blur-md">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground hierarchy-2 mb-2">Password Reset Successfully!</h1>
                <p className="text-default-500 font-medium">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                size="lg"
                radius="lg"
                fullWidth
                color="primary"
                className="btn-hover-lift font-semibold"
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                Continue to Login
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-default-50 to-primary-50/20 p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="card-enhanced glass-morphism border border-danger-200/50 shadow-2xl backdrop-blur-md">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-danger" />
                </div>
                <h1 className="text-2xl font-bold text-foreground hierarchy-2 mb-2">Invalid Reset Link</h1>
                <p className="text-default-500 font-medium">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <Button
                onClick={() => navigate("/forgot-password")}
                size="lg"
                radius="lg"
                fullWidth
                color="primary"
                className="btn-hover-lift font-semibold"
              >
                Request New Link
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-default-50 to-primary-50/20 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="card-enhanced glass-morphism border border-default-200/50 shadow-2xl backdrop-blur-md">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground hierarchy-2 mb-2">Reset Your Password</h1>
              <p className="text-default-500 font-medium">
                Enter your new password below to complete the reset process.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                isRequired
                label="New Password"
                size="lg"
                variant="bordered"
                radius="lg"
                placeholder="Enter your new password"
                type={showPassword ? "text" : "password"}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                startContent={<KeyRound className="w-4 h-4 text-default-400" />}
                endContent={
                  <button
                    className="focus:outline-none focus-enhanced p-1 rounded-md transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="text-xl text-default-400 hover:text-default-600 transition-colors" />
                    ) : (
                      <Eye className="text-xl text-default-400 hover:text-default-600 transition-colors" />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-sm font-medium",
                  inputWrapper:
                    "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                  label: "font-semibold text-default-700",
                }}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                })}
              />

              <Input
                isRequired
                label="Confirm Password"
                size="lg"
                variant="bordered"
                radius="lg"
                placeholder="Confirm your new password"
                type={showConfirmPassword ? "text" : "password"}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                startContent={<Shield className="w-4 h-4 text-default-400" />}
                endContent={
                  <button
                    className="focus:outline-none focus-enhanced p-1 rounded-md transition-colors"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-xl text-default-400 hover:text-default-600 transition-colors" />
                    ) : (
                      <Eye className="text-xl text-default-400 hover:text-default-600 transition-colors" />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-sm font-medium",
                  inputWrapper:
                    "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                  label: "font-semibold text-default-700",
                }}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
              />

              <div className="space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  radius="lg"
                  fullWidth
                  color="primary"
                  isLoading={isLoading}
                  className="btn-hover-lift font-semibold text-base py-6 bg-gradient-to-r from-primary to-primary-600 shadow-lg"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="light"
                    onClick={() => navigate("/login")}
                    className="font-semibold text-default-500 hover:text-primary transition-colors"
                    startContent={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
