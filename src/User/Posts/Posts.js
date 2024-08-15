import { useParams } from "react-router-dom";

export default function Posts() {
  const { no } = useParams();

  return (
    <div>
      <div>포스트~~{no}</div>
    </div>
  );
}
