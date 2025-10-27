import React from "react";
import "../styles/custominput.css";

const CustomInput = ({
  label,
  type = "text", // text, email, tel, select
  placeholder,
  icon: Icon,
  options = [], // for dropdowns
  multiple = false, // for multi-selects
  registerProps,
}) => {
  return (
    <div className="custom-input">
      {Icon && (
        <div className="input-icon">
          <Icon size={20} />
        </div>
      )}

      <div className="input-body">
        {label && <label>{label}</label>}

        {type === "select" ? (
          <select
            {...registerProps}
            multiple={multiple}
            defaultValue={registerProps.value || ""}
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
