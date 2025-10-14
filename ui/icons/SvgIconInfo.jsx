export function SvgIconInfo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M0 0h24v24H0z"></path>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#414a4c"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></circle>
      <path
        stroke="#414a4c"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11v6M11.75 8V7h.5v1z"
      ></path>
    </svg>
  );
}
