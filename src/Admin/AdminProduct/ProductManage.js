import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductManage() {
    const [products, setProducts] = useState([]); // 모든 상품 목록을 저장할 상태
    const [filteredProducts, setFilteredProducts] = useState([]); // 필터링된 상품 목록을 저장할 상태
    const [searchTerm, setSearchTerm] = useState(''); // 검색어를 저장할 상태
    const [searchField, setSearchField] = useState('name'); // 검색할 필드를 저장할 상태 (기본값: 이름)
    const navigate = useNavigate(); // 상세보기 페이지로 이동하기 위한 네비게이터

    // 서버에서 상품 목록을 가져와 상태를 초기화하는 함수
    const refresh = () => {
        axios.get("/admin/product")
            .then(res => {
                const formattedProducts = res.data.map(product => ({
                    ...product,
                    date: new Date(product.date).toLocaleDateString(), // 날짜를 포맷팅하여 저장
                }));
                setProducts(formattedProducts); // 상품 목록 상태 설정
                setFilteredProducts(formattedProducts); // 필터링된 목록 초기화
            })
            .catch(error => {
                console.log(error); // 오류 발생 시 콘솔에 로그 출력
            });
    };

    // 컴포넌트가 마운트될 때 상품 목록을 가져오는 함수 호출
    useEffect(() => {
        refresh(); 
    }, []);

    // 상품을 삭제하는 함수
    const handleDelete = (no) => {
        if (window.confirm("정말로 삭제하시겠습니까?")) { // 삭제 전 사용자에게 확인
            axios.delete("/admin/product/" + no)
                .then(res => {
                    alert("상품이 삭제되었습니다.");
                    refresh(); // 삭제 후 목록을 새로고침
                })
                .catch(error => {
                    console.log(error);
                    alert("삭제 중 오류가 발생했습니다."); // 오류 발생 시 사용자에게 알림
                });
        }
    };

    // 상품의 상세보기 페이지로 이동하는 함수
    const handleDetail = (no) => {
        navigate(`/admin/product/detail/${no}`);
    };

    // 검색 조건에 따라 상품 목록을 필터링하는 함수
    const filterProducts = () => {
        const filtered = products.filter(product => {
            if (searchField === 'name') {
                return product.name && product.name.includes(searchTerm);
            } else if (searchField === 'date') {
                return product.date && product.date.includes(searchTerm);
            } else if (searchField === 'category') {
                return product.category && product.category.includes(searchTerm);
            }
            return false;
        });
        setFilteredProducts(filtered); // 필터링된 상품 목록을 상태에 설정
    };

    // 검색어가 변경될 때 호출되는 함수
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // 검색어 상태 업데이트
    };

    // 검색할 필드를 변경할 때 호출되는 함수
    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value); // 검색 필드 상태 업데이트
    };

    // 검색 버튼 클릭 시 필터링을 수행하는 함수
    const handleSearch = () => {
        filterProducts();
    };

    // 전체보기 버튼 클릭 시 필터링을 초기화하는 함수
    const handleReset = () => {
        setSearchTerm(''); // 검색어 초기화
        setFilteredProducts(products); // 전체 목록으로 초기화
    };

    return (
        <>
            {/* 상품 추가 페이지로 이동하는 링크 */}
            <Link to="/admin/product/insert">상품 추가</Link>
            
            {/* 검색 필드와 검색어 입력 및 버튼들 */}
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'inline-block', marginRight: '10px' }}>
                    검색 :
                    <select value={searchField} onChange={handleSearchFieldChange} style={{ marginLeft: '10px', padding: '5px' }}>
                        <option value="name">이름</option>
                        <option value="date">날짜</option>
                        <option value="category">카테고리</option>
                    </select>
                </label>
                <input
                    type="text"
                    placeholder={`검색어를 입력하세요 (${searchField})`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ padding: '5px', width: '300px', marginRight: '10px' }}
                />
                <button onClick={handleSearch} style={{ padding: '5px 10px', marginRight: '10px' }}>검색</button>
                <button onClick={handleReset} style={{ padding: '5px 10px' }}>전체보기</button>
            </div>
            
            {/* 상품 목록을 테이블로 표시 */}
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
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(item => (
                            <tr key={item.no}>
                                <td>{item.no}</td>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                                <td>{item.contents}</td> {/* 상품 설명 */}
                                <td>{item.date}</td> {/* 포맷팅된 날짜 */}
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                                결과가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
}
