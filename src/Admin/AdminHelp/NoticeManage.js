import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function NoticeManage() {
  
  useEffect(() => {
    getNoticeList();
  }, [])

  const [notices, setNotices] = useState([]);

  const getNoticeList = () => {
    axios.get("/admin/help/notice")
    .then(response => {
      setNotices(response.data);
    })
    .catch(error => {
      console.log(error);
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <>
      <Link to="/admin/help/notices/new">공지 추가</Link><br/>
      <h1>공지 목록</h1>
      <table border="1">
          <thead>
              <tr>
                  <th>번호</th><th>분류</th><th>제목</th><th>등록일시</th>
              </tr>
          </thead>
          <tbody>
          {notices.map(notice => 
              <tr key={notice.no}>
                  <td>{notice.no}</td>
                  <td>{notice.category}</td>
                  <td><Link to={`/admin/help/notices/${notice.no}`}>{notice.title}</Link></td>
                  <td>{formatDate(notice.date)}</td>
              </tr>
          )}
          </tbody>
      </table>
      
    </>
  );
}
