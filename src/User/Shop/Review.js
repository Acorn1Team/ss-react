import { useParams } from "react-router-dom";

export default function Review() {
  const { no } = useParams();

  return (
    <div>
      <div>리뷰~~{no}</div>
    </div>
  );
}
