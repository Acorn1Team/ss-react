import { NavLink } from "react-router-dom";
import './Style/admin.css'

export default function AdminTop() {
    return (
        <>
            <h1>
                <NavLink to="/admin" id="admin-header" className={({ isActive }) => isActive ? 'active-link' : ''}>
                    Scene Stealer 관리자
                </NavLink>
            </h1>
            <ul id="topmenu">
                <li><NavLink to="/admin/fashion" className={({ isActive }) => isActive ? 'active-link' : ''}>패션</NavLink></li>
                <li><NavLink to="/admin/product" className={({ isActive }) => isActive ? 'active-link' : ''}>상품</NavLink></li>
                <li><NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active-link' : ''}>주문</NavLink></li>
                <li><NavLink to="/admin/community" className={({ isActive }) => isActive ? 'active-link' : ''}>커뮤니티</NavLink></li>
                <li><NavLink to="/admin/promotion" className={({ isActive }) => isActive ? 'active-link' : ''}>프로모션</NavLink></li>
                <li><NavLink to="/admin/help" className={({ isActive }) => isActive ? 'active-link' : ''}>고객 지원</NavLink></li>
                <li><NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>사용자 페이지</NavLink></li>
            </ul>
        </>
    )
}
