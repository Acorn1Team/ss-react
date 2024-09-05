import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../Style/NoticeDetail.module.css";

export default function NoticeDetail() {
  const { noticeNo } = useParams();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

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
    <div className={styles.container}>
      <div className={styles.category}>{noticeInfo.category}</div>
      <div className={styles.title}>{noticeInfo.title}</div>
      <div className={styles.date}>{formatDate(noticeInfo.date)}</div>
      <hr className={styles.hr} />
      <div className={styles.contents}>{noticeInfo.contents}</div>
    </div>
  );
}
