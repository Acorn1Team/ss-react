import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NoticeForm(){
    
    const navigate = useNavigate();
    const [state, setState] = useState({});

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]:e.target.value
        })
    }

    // 추가 버튼 클릭에 대한 이벤트 핸들러
    const handleSave = () => {
        axios.post("/admin/help/notice", state)
        .then(res => {
            if(res.data.isSuccess){
                alert("추가 성공");
                navigate("/admin/help/notices");
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    return(
        <>
            <h2>공지 추가</h2>
            <table>
                <tbody>
                <tr>
                    <td>제목</td>
                    <td><input onChange={handleChange} type="text" name="title" /></td>
                </tr>
                <tr>
                    <td>카테고리</td>
                    <td><select onChange={handleChange} name="category">
                            <option value="">선택해주세요</option>
                            <option value="주문">주문</option>
                            <option value="결제">결제</option>
                            <option value="반품/환불">반품/환불</option>
                            <option value="배송">배송</option>
                            <option value="프로모션/쿠폰">프로모션/쿠폰</option>
                            <option value="상품문의">상품문의</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>내용</td>
                    <td><textarea onChange={handleChange} name="contents" /></td>
                </tr>
            </tbody>
            </table>
            <button onClick={handleSave}>추가</button>
        </>
    );
}