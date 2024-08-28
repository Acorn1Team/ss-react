import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

export default function PromotionManage() {
    const [coupons, setCoupons] = useState([]);
    
    useEffect(() => {
        axios
            .get('/admin/coupons')
            .then((response) => {
                setCoupons(response.data);
            })
            .catch((error) => {
                console.log('쿠폰 목록 조회 오류', error);
            });
    }, []);

    return (
        <>
        <div style={{ padding: '20px' }}>
            <h2>Promotion</h2>
            <div style={{ marginBottom: '10px' }}>
                <h3>🩵쿠폰🩵
                <Link to="/admin/promotion/coupon">
                <button style={{ padding: '10px'}}>쿠폰 발급하기</button>
                </Link>
                </h3>
                <h4>발급한 쿠폰 목록</h4>
                <table>
                    <thead>
                        <tr><th>쿠폰명</th><th>할인율</th><th>만료일</th></tr>
                    </thead>
                    <tbody>
                    {coupons.map((coupon) => (
                    <tr key={coupon.no}>
                        <td>{coupon.name}</td>
                        <td>{coupon.discountRate}%</td>
                        <td>{coupon.expiryDate}까지</td>
                    </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            
            <hr/>
            <div style={{ marginBottom: '10px' }}>
                <h3>🩵광고🩵
                <Link to="/admin/promotion/advertise">
                    <button style={{ padding: '10px' }}>광고 알림 보내기</button>
                </Link>
                </h3>
            </div>
        </div>
        </>
    );
}
