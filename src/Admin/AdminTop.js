import { Link } from "react-router-dom";
import './Style/admin.css'

export default function AdminTop(){
    return(
        <>
            <h1><Link to="/admin" id="admin-header">Scene Stealer 관리자</Link></h1>
            <ul id="topmenu">
                <li><Link to="/admin/fashion">패션</Link></li>
                <li><Link to="/admin/product">상품</Link></li>
                <li><Link to="/admin/orders">주문</Link></li>
                <li><Link to="/admin/community">커뮤니티</Link></li>
                <li><Link to="/admin/promotion">프로모션</Link></li>
                <li><Link to="/admin/help">고객 지원</Link></li>
                <li><Link to="/">사용자 페이지</Link></li>
            </ul><br/>
        </>
        
    )    
}