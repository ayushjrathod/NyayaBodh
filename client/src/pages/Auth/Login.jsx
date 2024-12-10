import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, Input, Link, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { loginUser, registerUser } from "../../services/user";
import { login } from "../../store/slices/userSlice";

const API_URL = "http://127.0.0.1:8000";

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
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState("login");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);


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
      const userData = await loginUser(values);
      dispatch(login(userData.user));
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Handle register submission
  const onRegisterSubmit = async (values) => {
    try {
      const userData = await registerUser(values);
      dispatch(login(userData));
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Handle Google login success
  const onGoogleSuccess = async (tokenResponse) => {
    try {
      const { access_token } = tokenResponse;
      const userData = await axios.post(`${API_URL}/auth/google/callback`, { token: access_token });
      dispatch(login(userData.user));
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  // Handle Google login failure
  const onGoogleFailure = (error) => {
    console.error("Google login failed:", error);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleSuccess,
    onError: onGoogleFailure,
  });

  return (
    <div className="flex  justify-center  h-screen w-full ">
      <Card className="max-w-full mt-24 h-fit w-[340px] ">
        <CardBody className="overflow-hidden">
          <Tabs fullWidth size="md" aria-label="Tabs form" selectedKey={selected} onSelectionChange={setSelected}>
            {/* Login Form */}
            <Tab key="login" title="Login">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
                <Input
                  isRequired
                  label="Email"
                  isInvalid={!!loginForm.formState.errors.email}
                  errorMessage={loginForm.formState.errors.email?.message}
                  placeholder="Enter your email"
                  {...loginForm.register("email")}
                />

                <Input
                  isRequired
                  label="Password"
                  placeholder="Enter your password"
                  isInvalid={!!loginForm.formState.errors.password}
                  errorMessage={loginForm.formState.errors.password?.message}
                  type={showPassword ? "text" : "password"}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <Eye className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  {...loginForm.register("password")}
                />
                <p className="text-center text-small">
                  Forgot your password?{" "}
                  <Link
                    size="sm"
                    className="cursor-pointer underline font-semibold hover:bg-bsecondary/15"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Reset it
                  </Link>
                </p>

                <div className="flex gap-2 justify-end">
                  <Button type="submit" fullWidth color="primary">
                    Login
                  </Button>
                </div>
              </form>
              <div className="flex justify-center mt-4">
                <Button onClick={() => googleLogin()} fullWidth color="primary" variant="bordered">
                  Sign in with Google
                </Button>
              </div>
            </Tab>

            {/* Register Form */}
            <Tab key="sign-up" title="Sign up">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
                <Input
                  isRequired
                  label="Name"
                  isInvalid={!!registerForm.formState.errors.name}
                  errorMessage={registerForm.formState.errors.name?.message}
                  placeholder="Enter your name"
                  {...registerForm.register("name")}
                />

                <Input
                  isRequired
                  label="Email"
                  isInvalid={!!registerForm.formState.errors.email}
                  errorMessage={registerForm.formState.errors.email?.message}
                  placeholder="Enter your email"
                  {...registerForm.register("email")}
                />

                <Input
                  isRequired
                  label="Password"
                  isInvalid={!!registerForm.formState.errors.password}
                  errorMessage={registerForm.formState.errors.password?.message}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  {...registerForm.register("password")}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <Eye className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
                {registerForm.formState.errors.password && (
                  <span className="text-xs text-red-500 -mt-3">{registerForm.formState.errors.password.message}</span>
                )}
                <Select
                  label="Role"
                  isRequired
                  isInvalid={!!registerForm.formState.errors.role}
                  errorMessage={registerForm.formState.errors.role?.message}
                  {...registerForm.register("role")}
                  classNames={{
                    value: "text-small text-white",
                    popoverContent: ` ${isDarkMode && "dark"} bg-background text-foreground`,
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
                <p className="text-center text-small">
                  Already have an account?{" "}
                  <Link
                    size="sm"
                    className="cursor-pointer underline font-semibold hover:bg-bsecondary/15"
                    onPress={() => setSelected("login")}
                  >
                    Login
                  </Link>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button type="submit" fullWidth color="primary">
                    Sign up
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
