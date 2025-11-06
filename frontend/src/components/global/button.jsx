import React from "react";
import "../styles/button.css";

const Button = ({
  variant = "primary",  // ✅ for style ("primary" or "outline")
  type = "button",      // ✅ real HTML button type
  onClick,
  children,
  width = "auto",
  disabled = false,
  isLoading = false,
  loadingText = "Loading...",
}) => {
  const className = variant === "primary" ? "btn-primary" : "btn-outline";

  return (
    <button
      type={type}                // ✅ now behaves correctly in forms
      className={className}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{ width }}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default Button;
