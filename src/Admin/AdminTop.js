import { Link } from "react-router-dom";
import './Style/admin.css'

export default function AdminTop(){
    return(
        <>
            <h1>Scene Stealer 관리자</h1>
            <ul id="topmenu">
                <li><Link to="/admin/fashion">패션 편집</Link></li>
                <li><Link to="/admin/product">상품 관리</Link></li>
                <li><Link to="/admin/orders">주문 관리</Link></li>
                <li><Link to="/admin/help">고객 지원</Link></li>
                <li><Link to="/admin/community">커뮤니티 관리</Link></li>
                <li><Link to="/admin/promotion">프로모션</Link></li>
                <li><Link to="/admin/statistics">통계</Link></li>
                <li><Link to="/">사용자 페이지로 이동하기</Link></li>
            </ul><br/>
        </>
        
    )    
}