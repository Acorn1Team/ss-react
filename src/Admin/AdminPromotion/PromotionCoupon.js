import React from 'react';

export default function PromotionCoupon() {
    return (
        <div>
            <h2>쿠폰 등록</h2>
            <form>
                <div>
                    <label>쿠폰 이름</label>
                    <input type="text" name="name" />
                </div>
                <div>
                    <label>할인율</label>
                    <input type="number" name="discount-rate" />
                    <span>%</span>
                </div>
                <div>
                    <label>유효기간</label>
                    <input type="date" name="expiry-date" />
                    
                </div>
                <button type="submit">등록</button>
            </form>
        </div>
    );
}
