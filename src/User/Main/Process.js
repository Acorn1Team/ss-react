import { useNavigate } from "react-router-dom";

export default function Process() {
  const nv = useNavigate();
  nv("/user");
}
