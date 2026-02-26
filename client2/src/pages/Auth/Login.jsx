import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, Link, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { login as apiLogin, register as apiRegister } from "../../api/axios";
import { ValidatedInput, validationRules, useToast } from "../../components/ui";
import { apiConfig } from "../../config/api";
import { setAuthState, setUserRole } from "../../store/slices/authSlice";

// Define the login and register schemas with zod
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["USER", "ADMIN", "JUDGE", "LAWYER", "CLERK"]),
});

export default function Login() {
  const [selected, setSelected] = useState("login");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { toast } = useToast();

  // Setup forms with react-hook-form and zodResolver for validation
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values) => {
    try {
      console.log("Attempting login with values:", values);
      toast.loading("Signing you in...");
      
      const response = await apiLogin(values);
      console.log("Login response:", response);

      const user = JSON.parse(localStorage.getItem("user"));
      console.log("User from localStorage:", user);

      dispatch(setAuthState(true));
      dispatch(setUserRole(user.role));

      toast.success("Login successful! Welcome back.");
      console.log("About to navigate to /");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  // Handle register submission
  const onRegisterSubmit = async (values) => {
    try {
      toast.loading("Creating your account...");
      
      await apiRegister(values);
      const user = JSON.parse(localStorage.getItem("user"));
      dispatch(setAuthState(true));
      dispatch(setUserRole(user.role));
      
      toast.success("Account created successfully! Welcome to NyayBodh.");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  // Handle Google login success
  const onGoogleSuccess = async (tokenResponse) => {
    try {
      console.log("Google login success, access_token received");
      toast.loading("Signing in with Google...");
      
      const { access_token } = tokenResponse;
      const userData = await axios.post(apiConfig.endpoints.auth.googleVerify, { token: access_token });

      console.log("Google verify response:", userData.data);

      const { access_token: jwt_token, role, user_id, fullname } = userData.data;

      const user = {
        id: user_id,
        role: role,
        fullname: fullname,
      };

      console.log("Storing Google user data:", user);

      localStorage.clear();
      localStorage.setItem("token", jwt_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");

      console.log("Stored data verification:", {
        hasToken: Boolean(localStorage.getItem("token")),
        user: localStorage.getItem("user"),
        isAuthenticated: localStorage.getItem("isAuthenticated"),
      });

      dispatch(setAuthState(true));
      dispatch(setUserRole(role));
      window.dispatchEvent(new Event("auth-state-changed"));

      toast.success("Google sign-in successful!");
      console.log("Google login complete, navigating to /");
      setTimeout(() => navigate("/"), 100);
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  // Handle Google login failure
  const onGoogleFailure = (error) => {
    console.error("Google login failed:", error);
    toast.error("Google sign-in was cancelled or failed.");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleSuccess,
    onError: onGoogleFailure,
  });

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-default-50 to-primary-50/20">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="card-enhanced glass-morphism border border-default-200/50 shadow-2xl backdrop-blur-md">
          <CardBody className="overflow-hidden p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground hierarchy-2 mb-2">Welcome Back</h1>
              <p className="text-default-500 font-medium">Sign in to continue to NyayBodh</p>
            </div>

            <Tabs
              fullWidth
              size="lg"
              aria-label="Authentication tabs"
              selectedKey={selected}
              onSelectionChange={setSelected}
              classNames={{
                tabList: "bg-default-100/50 backdrop-blur-sm",
                tab: "font-semibold",
                cursor: "bg-primary shadow-lg",
                tabContent: "group-data-[selected=true]:text-primary-foreground",
              }}
            >
              {/* Login Form */}
              <Tab key="login" title="Login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-6 mt-4">
                  <ValidatedInput
                    label="Email"
                    name="email"
                    type="email"
                    value={loginForm.watch("email")}
                    onChange={(e) => loginForm.setValue("email", e.target.value)}
                    validation={validationRules.email}
                    placeholder="Enter your email address"
                    isRequired
                    realTimeValidation={false}
                    classNames={{
                      inputWrapper: "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                    }}
                  />

                  <ValidatedInput
                    label="Password"
                    name="password"
                    type="password"
                    value={loginForm.watch("password")}
                    onChange={(e) => loginForm.setValue("password", e.target.value)}
                    validation={validationRules.required}
                    placeholder="Enter your password"
                    isRequired
                    realTimeValidation={false}
                    classNames={{
                      inputWrapper: "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                    }}
                  />

                  <div className="text-center">
                    <Link
                      size="sm"
                      className="cursor-pointer font-semibold text-primary hover:text-primary-600 transition-colors"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      radius="lg"
                      fullWidth
                      color="primary"
                      isLoading={loginForm.formState.isSubmitting}
                      className="btn-hover-lift font-semibold text-base py-6 bg-gradient-to-r from-primary to-primary-600 shadow-lg"
                    >
                      {loginForm.formState.isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>

                    <Button
                      onClick={() => googleLogin()}
                      size="lg"
                      radius="lg"
                      fullWidth
                      variant="bordered"
                      className="btn-hover-lift font-semibold border-2 border-default-200 hover:border-primary-300 py-6"
                      startContent={
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      }
                    >
                      Continue with Google
                    </Button>
                  </div>
                </form>
              </Tab>

              {/* Register Form */}
              <Tab key="sign-up" title="Sign up">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-6 mt-4">
                  <ValidatedInput
                    label="Full Name"
                    name="name"
                    value={registerForm.watch("name")}
                    onChange={(e) => registerForm.setValue("name", e.target.value)}
                    validation={validationRules.minLength(2)}
                    placeholder="Enter your full name"
                    isRequired
                    startContent={<User className="w-4 h-4 text-default-400" />}
                    classNames={{
                      inputWrapper: "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                    }}
                  />

                  <ValidatedInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={registerForm.watch("email")}
                    onChange={(e) => registerForm.setValue("email", e.target.value)}
                    validation={validationRules.email}
                    placeholder="Enter your email address"
                    isRequired
                    classNames={{
                      inputWrapper: "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                    }}
                  />

                  <ValidatedInput
                    label="Password"
                    name="password"
                    type="password"
                    value={registerForm.watch("password")}
                    onChange={(e) => registerForm.setValue("password", e.target.value)}
                    validation={validationRules.password}
                    placeholder="Create a strong password"
                    isRequired
                    classNames={{
                      inputWrapper: "border-default-200 hover:border-primary-300 focus-within:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                    }}
                  />

                  <Select
                    label="Role"
                    size="lg"
                    variant="bordered"
                    radius="lg"
                    isRequired
                    placeholder="Select your role"
                    value={registerForm.watch("role")}
                    onChange={(e) => registerForm.setValue("role", e.target.value)}
                    classNames={{
                      trigger: "border-default-200 hover:border-primary-300 data-[focus=true]:border-primary backdrop-blur-sm bg-default-50/50",
                      label: "font-semibold text-default-700",
                      value: "text-sm font-medium",
                      popoverContent: `${isDarkMode ? "dark" : ""} bg-background text-foreground`,
                    }}
                  >
                    <SelectItem key="USER" value="USER">
                      Normal User
                    </SelectItem>
                    <SelectItem key="ADMIN" value="ADMIN">
                      Admin
                    </SelectItem>
                    <SelectItem key="JUDGE" value="JUDGE">
                      Judge
                    </SelectItem>
                    <SelectItem key="LAWYER" value="LAWYER">
                      Lawyer
                    </SelectItem>
                  </Select>

                  <div className="text-center">
                    <p className="text-sm text-default-500">
                      Already have an account?{" "}
                      <Link
                        size="sm"
                        className="cursor-pointer font-semibold text-primary hover:text-primary-600 transition-colors"
                        onPress={() => setSelected("login")}
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      radius="lg"
                      fullWidth
                      color="primary"
                      isLoading={registerForm.formState.isSubmitting}
                      className="btn-hover-lift font-semibold text-base py-6 bg-gradient-to-r from-primary to-primary-600 shadow-lg"
                    >
                      {registerForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>

            {/* Add "New here?" link for login tab */}
            {selected === "login" && (
              <div className="text-center mt-6 pt-4 border-t border-default-200">
                <p className="text-sm text-default-500">
                  New to NyayBodh?{" "}
                  <Link
                    size="sm"
                    className="cursor-pointer font-semibold text-primary hover:text-primary-600 transition-colors"
                    onPress={() => setSelected("sign-up")}
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}