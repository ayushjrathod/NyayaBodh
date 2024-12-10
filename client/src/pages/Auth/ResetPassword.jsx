import { Button, Input } from "@nextui-org/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    try {
      await axios.post("/api/auth/reset-password", { token, new_password: data.password });
      alert("Password reset successful");
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="New Password"
        placeholder="Enter your new password"
        type="password"
        {...register("password", {
          required: "Password is required",
          minLength: { value: 6, message: "Password must be at least 6 characters" },
        })}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
      />
      <Button type="submit">Reset Password</Button>
    </form>
  );
}
