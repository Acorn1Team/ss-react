import React from 'react';
import { Link } from 'react-router-dom';


export default function PromotionManage() {
    return (
        <>
            <div style={{ padding: '20px' }}>
                <h2>Promotion </h2>
                <div style={{ marginBottom: '10px' }}>
                    <Link to="/admin/promotion/coupon">
                        <button style={{ padding: '10px', marginRight: '10px' }}>쿠폰 페이지이동</button>
                    </Link>
                    <Link to="/admin/promotion/advertise">
                        <button style={{ padding: '10px' }}>광고 페이지 이동</button>
                    </Link>
                </div>
            </div>
        </>
    );
}
