import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function NoticeDetail() {
  const { noticeNo } = useParams();

  const [noticeInfo, setNoticeInfo] = useState({});

  const getNoticeInfo = () => {
    axios
      .get(`/user/notice/${noticeNo}`)
      .then((res) => {
        setNoticeInfo(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getNoticeInfo();
  }, [noticeNo]);

  return (
    <div>
      {noticeInfo.category}
      <br />
      {noticeInfo.title}
      <br />
      {noticeInfo.date}
      <br />
      {noticeInfo.contents}
    </div>
  );
}
