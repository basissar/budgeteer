const DownArrow = ({ color }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={color || "currentColor"}
        viewBox="0 0 20 20"
        className="w-5 h-5"
    >
        <path d="M10 17a1 1 0 01-1-1V3.41l-3.3 3.3a1 1 0 01-1.4-1.42l5-5a1 1 0 011.4 0l5 5a1 1 0 01-1.4 1.42L11 3.41V16a1 1 0 01-1 1z" />
    </svg>
);

export default DownArrow;
