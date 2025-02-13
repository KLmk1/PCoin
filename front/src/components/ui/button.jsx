import PropTypes from 'prop-types';

const Button = ({ children, onClick, className }) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}>
      {children}
    </button>
  );
};

export default Button;


// PropTypes validation
Button.propTypes = {
  onClick: PropTypes.func.isRequired,   // 'onClick' must be a function and is required
  children: PropTypes.node.isRequired,  // 'children' must be any valid React node (like text, elements, etc.)
  className: PropTypes.string,          // 'className' is optional and must be a string if provided
  disabled: PropTypes.bool,             // 'disabled' is optional and should be a boolean
};

export { Button };
