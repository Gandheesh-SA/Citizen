import React from "react";
import "../styles/button.css";

const Button = ({
  type = "primary", // "primary" or "outline"
  onClick,
  children,
  width = "auto",
  disabled = false,
  isLoading = false,
  loadingText = "Loading..."
}) => {
  const className = type === "primary" ? "btn-primary" : "btn-outline";

  return (
    <button
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