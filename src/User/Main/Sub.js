import { useParams } from "react-router-dom";

export default function Sub() {
  const { no } = useParams();

  return (
    <div>
      어쩌구<div>어쩌구!!{no}</div>
    </div>
  );
}
