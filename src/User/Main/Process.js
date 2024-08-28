import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Process() {
  const nv = useNavigate();
  useEffect(() => {
    nv("/user");
  }, []);
}
