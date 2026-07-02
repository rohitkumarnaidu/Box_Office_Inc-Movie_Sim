import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthInput = ({
  label,
  placeholder,
  type = "text",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [showPassword, setShowPassword] =
    useState(false);

  const isPassword =
    type === "password";

  return (
    <div className="relative">
      {label && (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={
          isPassword
            ? showPassword
              ? "text"
              : "password"
            : type
        }
        placeholder={placeholder}
        className="
        w-full
        bg-slate-800
        text-white
        placeholder:text-slate-400
        border
        border-slate-700
        rounded-2xl
        px-5
        py-4
        pr-14
        outline-none
        focus:border-violet-500
        transition
        "
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-white
          "
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      )}
    </div>
  );
};

export default AuthInput;