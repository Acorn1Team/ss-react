import { useEffect, useState } from "react";
import AdminTop from "../AdminTop";
import axios from "axios";
import { Link } from "react-router-dom";

export default function NoticeManage() {

  const [notices, setNotices] = useState([]);

  const getNoticeList = () => {
    axios.get("/admin/notice")
    .then(response => {
      setNotices(response.data);
    })
    .catch(error => {
      console.log(error);
    })
  }

  useEffect(() => {
    getNoticeList();
  }, [])

  return (
    <>
      <AdminTop></AdminTop>
      <Link to="/notices/new">공지 추가</Link><br/>
      <h1>회원 목록</h1>
      <table border="1">
          <thead>
              <tr>
                  <th>번호</th><th>분류</th><th>제목</th><th>내용</th><th>날짜</th>
              </tr>
          </thead>
          <tbody>
          {notices.map(notice => 
              <tr key={notice.no}>
                  <td>{notice.no}</td>
                  <td>{notice.category}</td>
                  <td>{notice.title}</td>
                  <td>{notice.contents}</td>
                  <td>{notice.date}</td>
              </tr>
          )}
          </tbody>
      </table>
      
    </>
  );
}
