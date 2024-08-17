import AdminTop from "../AdminTop";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductManage() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const refresh = () => {
        axios.get("/admin/product")
            .then(res => {
                const formattedProducts = res.data.map(product => ({
                    ...product,
                    date: new Date(product.date).toLocaleString(), // 날짜 및 시간 포맷팅
                }));
                setProducts(formattedProducts);
                console.log(formattedProducts);
            })
            .catch(error => {
                console.log(error);
            });
    };

    useEffect(() => {
        refresh(); 
    }, []);

    const handleDelete = (no) => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            axios.delete("/admin/product/" + no)
                .then(res => {
                    alert("상품이 삭제되었습니다.");
                    refresh(); // 삭제 후 목록을 새로고침
                })
                .catch(error => {
                    console.log(error);
                    alert("삭제 중 오류가 발생했습니다.");
                });
        }
    };

    const handleDetail = (no) => {
        navigate(`/admin/product/detail/${no}`);
    };

    return (
        <>
            <AdminTop />
            <Link to="/admin/product/insert">상품 추가</Link>
            <table border={1}>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>이름</th>
                        <th>가격</th>
                        <th>내용</th>
                        <th>날짜</th>
                        <th>카테고리</th>
                        <th>이미지</th>
                        <th>재고</th>
                        <th>할인률</th>
                        <th>평점</th>
                        <th>상세보기</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(item => (
                        <tr key={item.no}>
                            <td>{item.no}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.contents}</td> {/* 상품 설명 */}
                            <td>{item.date}</td> {/* 포맷팅된 날짜 및 시간 */}
                            <td>{item.category}</td>
                            <td>
                                {/* 이미지 경로를 사용하여 이미지를 표시 */}
                                <img src={item.pic} alt={item.name} style={{ width: '100px', height: '100px' }} />
                            </td>
                            <td>{item.stock}</td>
                            <td>{item.discountRate}</td>
                            <td>{item.score}</td>
                            <td>
                                <span 
                                    onClick={() => handleDetail(item.no)} 
                                    style={{ cursor: 'pointer', color: 'blue' }}>
                                    상세보기
                                </span>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(item.no)}>
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
