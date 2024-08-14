import AdminTop from "../AdminTop"
import { useState,useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductManage(){
    const [members,setMembers] = useState([]);
    const refresh = () => {
        // ajax 요청 (GET 방식) 설정
        axios.get("/admin/product")
        .then(res =>{
            // 서버로부터 응답된 데이터를 이용해서 State를 수정
            setMembers(res.data)
            console.log(res.data)
        })
        .catch(error =>{
            console.log(error)
        })
    }

    useEffect(() => {
        refresh(); // Ajax 요청 처리 시작 
    },[])

    // 삭제 버튼 클릭시 이벤트 핸들러 함수

    const handleDelete = (no) => {
        // ajax 요청 (delete 방식) 설정
        axios.delete("/admin/product/" + no)
        .then(res =>{
            // 삭제후 목록 보기
            refresh();
        })
        .catch(error =>{
            console.log(error);
        })
    }

    return(
        <>
            <AdminTop></AdminTop>
            <table border={1}>
                <thead>
                    <tr>
                        <th>번호</th><th>이름</th><th>가격</th><th>상품설명</th><th>날짜</th>
                        <th>카테고리</th><th>이미지</th><th>재고</th><th>할인률</th><th>평점</th>
                    </tr>
                </thead>
                <tbody>
                   {members.map(item => <tr key={item.no}>
                        <td>{item.no}</td>
                        <td>{item.name}</td>
                        <td>{item.price}</td>
                        <td>{item.contents}</td>
                        <td>{item.date}</td>
                        <td>{item.category}</td>
                        <td>{item.pic}</td>
                        <td>{item.stock}</td>
                        <td>{item.discountRate}</td>
                        <td>{item.score}</td>
                      
                        <td>
                          
                        </td>
                        <td>
                           
                        </td>
                   </tr>)

                   } 
                </tbody>
            </table>
        </>
        
    )    
}
