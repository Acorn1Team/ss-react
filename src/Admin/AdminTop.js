import { Link } from "react-router-dom";

export default function AdminHome(){
    return(
        <>
            <h2>🤖🔨관리자 페이지🔨🤖</h2>
            <ul>
                <li><Link to="/admin/mainedit">메인 편집</Link></li>
                <li><Link to="/admin/product">상품 관리</Link></li>
                <li><Link to="/admin/order">주문 관리</Link></li>
                <li><Link to="/admin/help">고객 지원</Link></li>
                <li><Link to="/admin/community">커뮤니티 관리</Link></li>
                <li><Link to="/admin/promotion">프로모션</Link></li>
            </ul>
        </>
        
    )    
}