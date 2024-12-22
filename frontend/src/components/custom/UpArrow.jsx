const UpArrow = ({ color }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={color || "currentColor"}
        viewBox="0 0 20 20"
        className="w-5 h-5"
    >
        <path d="M10 3a1 1 0 011 1v12.59l3.3-3.3a1 1 0 111.4 1.42l-5 5a1 1 0 01-1.4 0l-5-5a1 1 0 111.4-1.42l3.3 3.3V4a1 1 0 011-1z" />
    </svg>
);

export default UpArrow;
