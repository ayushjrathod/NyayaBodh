import { Button, Input } from "@nextui-org/react";
import axios from "axios";
import { useForm } from "react-hook-form";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:8000/api/auth/forgot-password", data);
      alert("If the email exists, a reset link will be sent");
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  return (
    <form className="flex flex-col items-center justify-center h-screen" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        className="w-1/3 m-4"
        placeholder="Enter your email"
        {...register("email", { required: "Email is required" })}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
      />
      <Button type="submit">Send Reset Link</Button>
    </form>
  );
}
