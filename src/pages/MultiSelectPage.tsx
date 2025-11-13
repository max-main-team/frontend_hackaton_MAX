import { Link } from "react-router-dom";

export default function MultiSelectPage() {
  return (
    <div style={{ padding: 20 }}>
      <h3>Test 2 — Link</h3>
      <Link to="/student" style={{ display: "inline-block", padding: "12px 18px", background: "#0ea5e9", color: "#fff", borderRadius: 6, textDecoration: "none" }}>
        Link to /student
      </Link>
    </div>
  );
}