import PropTypes from "prop-types";

const Input = ({ type, value, onChange, className }) => {
  return <input type={type} value={value} onChange={onChange} className={`border p-2 rounded ${className}`} />;
};

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Input;
