import { Button, Card, CardBody, Input, Link } from "@nextui-org/react";
import axios from "axios";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../../config/api";

/**
 * ForgotPassword React component.
 *
 * Renders a two-step "forgot password" UI: an email input form (with client-side validation)
 * and a confirmation screen after a successful request. Submitting the form sends a POST
 * request to the configured forgot-password endpoint; on success the component shows a
 * confirmation view that displays the submitted email and a "Back to Login" action.
 *
 * Side effects:
 * - Sends an HTTP POST to apiConfig.endpoints.auth.forgotPassword via axios.
 * - Navigates to "/login" when the user clicks "Back to Login".
 * - Logs errors to the console if the request fails.
 *
 * Uses react-hook-form for form state/validation and NextUI components for UI.
 *
 * @returns {JSX.Element} The forgot-password page UI.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(apiConfig.endpoints.auth.forgotPassword, data);
      setIsEmailSent(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-default-50 to-primary-50/20 p-4">
        <div className="w-full max-w-md animate-fade-in-scale">
          <Card className="card-enhanced glass-morphism border border-default-200/50 shadow-2xl backdrop-blur-md">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground hierarchy-2 mb-2">Email Sent!</h1>
                <p className="text-default-500 font-medium">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-semibold text-foreground">{getValues("email")}</span>
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-default-400">
                  Check your email and click the link to reset your password. If you don&apos;t see it, check your spam
                  folder.
                </p>

                <Button
                  onClick={() => navigate("/login")}
                  size="lg"
                  radius="lg"
                  fullWidth
                  color="primary"
                  className="btn-hover-lift font-semibold"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Login
                </Button>
              </div>
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
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground hierarchy-2 mb-2">Forgot Password?</h1>
              <p className="text-default-500 font-medium">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                isRequired
                label="Email Address"
                size="lg"
                variant="bordered"
                radius="lg"
                placeholder="Enter your email address"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                startContent={<Mail className="w-4 h-4 text-default-400" />}
                classNames={{
                  input: "text-sm font-medium",
                  inputWrapper:
                    "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                  label: "font-semibold text-default-700",
                }}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
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
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link
                    onClick={() => navigate("/login")}
                    className="cursor-pointer font-semibold text-default-500 hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
