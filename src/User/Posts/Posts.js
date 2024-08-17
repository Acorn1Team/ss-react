import { useParams } from "react-router-dom";

export default function Posts() {
  const { postNo } = useParams();

  // 로그인 정보라고 가정
  const userNo = 3;

  return (
    <div>
      <div>포스트~~{postNo}</div>
    </div>
  );
}
