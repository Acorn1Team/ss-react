import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NoticeDetail(){
    const {no} = useParams(); // URL 파라미터에서 no 값 추출

    // 수정할 정보 state로 관리
    const [state, setState] = useState({
        category:"",
        title:"",
        contents:""
    });

    useEffect(() => {
        axios.get("/admin/notice/" + no)
        .then(res => {
            setState(res.data)
        })
        .catch(err => {
            console.log(err);
        })   
    }, [no]) // (의존성 배열) 배열 안의 값이 변경되면, useEffect가 재실행됨
    
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]:e.target.value
        })
    }

    const navigate = useNavigate();

    const handleSave = () => {
        axios.put("/admin/notice/" + no, state)
        .then(res => {
            // 수정 후 목록보기
            if(res.data.isSuccess){ // JS가 지원하는, 데이터를 받는 변수 data에서 우리가 보냈던 isSucess 값 받기
                alert("수정 성공");
                navigate("/admin/help/notice") // 이벤트에 의해 페이지가 넘어가야 하므로 navigate 함수 사용
            }
        })
        .catch(err => {
            console.log(err);
        })
    }


    return(
        <>
            <h2>공지 수정</h2>
            <div>
                <label for="title">제목: </label>
                <input onChange={handleChange} type="text" name="title" /><br/>
                <label for="addr">내용: </label>
                <textarea onChange={handleChange} name="contents" /><br />
                <button onClick={handleSave}>수정</button>
            </div>
        </>
    );
}