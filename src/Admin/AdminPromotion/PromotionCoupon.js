import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PromotionCoupon() {
    const navigate = useNavigate();
    const [state, setState] = useState({});

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const addCoupon = () => {
        axios
            .post("/admin/coupon", state)
            .then((response) => { // 추가된 작품의 PK 반환
                if(response.data.isSuccess){
                    alert("추가 성공");
                    navigate("/admin/coupon");
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <h2>쿠폰 등록</h2>
            <div>
                <label>쿠폰 이름</label>
                <input type="text" name="name" onChange={handleChange} />
            </div>
            <div>
                <label>할인율</label>
                <input type="number" name="discountRate" onChange={handleChange} />
                <span>%</span>
            </div>
            <div>
                <label>유효기간</label>
                <input type="date" name="expiryDate" onChange={handleChange} />
            </div>
            <button onClick={addCoupon}>등록</button>
        </div>
    );
}
