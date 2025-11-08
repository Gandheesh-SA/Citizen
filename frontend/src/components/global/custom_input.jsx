import React from "react";
import "../../styles/custominput.css";

const CustomInput = ({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  options = [],
  multiple = false,
  registerProps,
}) => {
  return (
    <div className="custom-input1">
      {Icon && (
        <div className="input-icon1">
          <Icon size={20} />
        </div>
      )}

      <div className="input-body1">
        {label && <label>{label}</label>}

        {type === "select" ? (
          <select
            {...registerProps}
            multiple={multiple}
            value={registerProps.value || ""} // ✅ controlled select
          >
            {!multiple && (
              <option value="" disabled>
                {placeholder || "Select an option"}
              </option>
            )}
            {options.map((opt, i) => (
              <option key={i} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input type={type} placeholder={placeholder} {...registerProps} />
        )}
      </div>
    </div>
  );
};

export default CustomInput;
