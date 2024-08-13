import { Link } from "react-router-dom";

export default function AdminHome(){
    return(
        <>
            <h2>관리자 메인 페이지</h2>
            <table>
                <thead>
                    <tr>
                        <th><Link to="/admin/main">메인</Link></th>
                        <th><Link to="/admin/product">상품</Link></th>
                        <th><Link to="/admin/order">주문</Link></th>
                        <th><Link to="/admin/help">지원</Link></th>
                        <th><Link to="/admin/community">커뮤니티</Link></th>
                        <th><Link to="/admin/promotion">프로모션</Link></th>
                    </tr>
                </thead>
            </table>
        </>
        
    )    
}