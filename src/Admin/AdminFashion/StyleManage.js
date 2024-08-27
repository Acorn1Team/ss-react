import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import styled from "styled-components";

export default function StyleManage() {
  const { no } = useParams();
  const location = useLocation();
  const actorData = location.state;
  const navigate = useNavigate();

  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState(null);
  const styleInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(null);
  const [itemKeyword, setItemKeyword] = useState(''); // 아이템 검색 입력값
  const [productKeyword, setProductKeyword] = useState(''); // 상품 검색 입력값
  const [productNo, setProductNo] = useState(); // 새로운 아이템 추가 시 연결할 상품 PK
  const [newItemName, setNewItemName] = useState(''); // 새로운 아이템 이름
  
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isExistingItemModalOpen, setIsExistingItemModalOpen] = useState(false);

  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentStyle, setCurrentStyle] = useState({});

  useEffect(() => {
    axios
      .get(`/admin/fashion/character/${no}/style`)
      .then((response) => {
        setStyles(response.data);
        getItems(no);
      })
      .catch((error) => {
        console.log(error);
      });

    const getItems = (no) => {
      axios
      .get(`/admin/fashion/character/${no}/item`)
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }, [no]);

  const onStyleFileChange = (e) => {
    setNewStyle(e.target.files[0]);
  }

  const onItemFileChange = (e) => {
    setNewItem(e.target.files[0]);
  }

  const onProductKeywordChange = (e) => {
    setProductKeyword(e.target.value);
    fetchProductData();
  }

  const onItemKeywordChange = (e) => {
    setItemKeyword(e.target.value);
    fetchItemData();
  }

  const fetchItemData = async () => {
    if (itemKeyword) {
      try {
        const response = await axios.get(`/admin/item/autocomplete/${itemKeyword}`);
        setFilteredItems(response.data);
      } catch (error) {
        console.error(`너가 입력한 ${itemKeyword}에서 못 가져오겠어: `, error);
        setFilteredItems([]);
      }
    } else {
      // 입력값 없을 때는 전체 목록을 가져온다.
      try {
        const response = await axios.get('/admin/item/autocomplete');
        setFilteredItems(response.data);
      } catch (error) {
        console.error("아이템 못 가져오겠어: ", error);
        setFilteredItems([]);
      }
    }
  };

  const fetchProductData = async () => {
    if (productKeyword) {
      try {
        const response = await axios.get(`/admin/product/autocomplete/${productKeyword}`);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error(`너가 입력한 ${itemKeyword}에서 못 가져오겠어: `, error);
        setFilteredProducts([]);
      }
    } else {
      // 입력값 없을 때는 전체 목록을 가져온다.
      try {
        const response = await axios.get('/admin/product/autocomplete');
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("상품 못 가져오겠어: ", error);
        setFilteredProducts([]);
      }
    }
  };

  const onItemNameChange = (e) => {
    setNewItemName(e.target.value);
  }

  const addStyle = async() => {
    const styleForm = new FormData();
    styleForm.append('file', newStyle);
    
    await axios
      .post(`/admin/fashion/character/${no}/style`, styleForm, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      .then((response) => {
        setStyles((prevStyles) => [...prevStyles, response.data]);
        setNewStyle(null);
        if (styleInputRef.current) {
          styleInputRef.current.value = "";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const addExistingItem = async(style_no, item_no) => {
    setIsExistingItemModalOpen(false);
    await axios
      .post(`/admin/fashion/${style_no}/item/${item_no}`)
      .then(
        axios
        .get(`/admin/fashion/character/${no}/item`)
        .then((response) => {
          setItems(response.data);
        })
        .catch((error) => {
          console.log(error);
        }))
      .catch((error) => {
        console.log(error);
      });
  }

  const addItem = async(style_no) => {
    const itemForm = new FormData();
    itemForm.append('file', newItem);
    itemForm.append('product', productKeyword);
    
    await axios
      .post(`/admin/fashion/${style_no}/item`, itemForm, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      .then((response) => {
        setItems((prevItems) => [...prevItems, response.data]);
        setNewItem(null);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  if (!actorData) { return <p>상세 정보를 불러올 수 없습니다.</p>; }
  return (
    <>
      <div>
        <img src={actorData.pic} alt={`${actorData.character} 이미지`} />
        {actorData.character} ({actorData.actor}) 의 스타일
      </div>
      <table border="1">
        <thead>
          <tr><td colSpan='4'>
            스타일 추가하기<br/>
            <input type="file" onChange={onStyleFileChange} ref={styleInputRef}/>
            <button onClick={addStyle}>추가</button>
          </td></tr>
          <tr>
            <th>스타일</th>
            <th>아이템1</th>
            <th>아이템2</th>
            <th>아이템3</th>
          </tr>
        </thead>
        <tbody>
          {styles.map((styleData, index) => { // styleData.no와 일치하는 items 필터링
            const filteredItems = items.filter(item => item.style === styleData.no);
            return (
              <tr key={index}>
                <td><img src={styleData.pic} alt={`${index + 1}번 스타일`} /></td>
                {[0, 1, 2].map((i) => (
                  <td key={i}>
                    {filteredItems[i] ? 
                      (<>{filteredItems[i].name}<br/>
                      <img src={filteredItems[i].pic} alt={`${index}번 스타일 아이템${i+1}`} /><br/>
                      <button onClick={() => navigate(`/admin/product/detail/${filteredItems[i].product}`)}>유사상품 조회하기</button></>) 
                    : (<>
                          <button onClick={() => {
                            setCurrentStyle(styleData);
                            setIsNewItemModalOpen(true);
                          }}>🛍️새로운 아이템으로 추가하기🛍️</button>
                          <br/><br/>
                          <button onClick={() => {
                            setCurrentStyle(styleData);
                            setIsExistingItemModalOpen(true);
                          }}>🛍️기존 아이템으로 추가하기🛍️</button>
                      </>)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <Modal
        isOpen={isNewItemModalOpen}
        onRequestClose={() => setIsNewItemModalOpen(false)}
        contentLabel="새로운 아이템 추가하기"
        style={{overlay: {backgroundColor: "rgba(0, 0, 0, 0.5)",},
                content: {background: "white",padding: "20px", borderRadius: "8px", textAlign: "center", maxWidth: "500px", margin: "auto",},}}
      >
        <img height='100px' src={currentStyle.pic} alt={`${currentStyle.no}번 스타일`} /><br/>
        {currentStyle.no}번 스타일에 신규 아이템 연결하기
        <button onClick={() => setIsNewItemModalOpen(false)}>닫기</button>
        
        <SearchForm>
          <SearchInput type="text" value={productKeyword} placeholder="연결할 상품명을 입력하세요" onChange={onProductKeywordChange} 
          onFocus={() => {setShowProductDropdown(true); fetchProductData()}} 
          />
          {showProductDropdown && (
          <AutoSearchContainer>
          {filteredProducts.map((product, index) => (
            <AutoSearchItem key={index}>
              {product.name} <img height='100px' src={product.pic} alt={`${product.name} 사진`} />
              <SearchButton onMouseDown={() => {setProductNo(product.no); setProductKeyword(product.name); setShowProductDropdown(false);}}>연결</SearchButton>
            </AutoSearchItem>
          ))}
          </AutoSearchContainer>
          )}
        </SearchForm>
        <table>
          <tbody>
            <tr>
              <td>아이템 사진</td>
              <td><input type="file" onChange={onItemFileChange} /></td>
            </tr>
            <tr>
              <td>아이템 이름</td>
              <td><input type="text" onChange={onItemNameChange} /></td>
            </tr>
          </tbody>
        </table>
        <button onClick={() => addItem}>추가</button>
      </Modal>

      <Modal
        isOpen={isExistingItemModalOpen}
        onRequestClose={() => setIsExistingItemModalOpen(false)}
        contentLabel="기존 아이템 추가하기"
        style={{overlay: {backgroundColor: "rgba(0, 0, 0, 0.5)",},
                content: {background: "white",padding: "20px", borderRadius: "8px", textAlign: "center", maxWidth: "500px", margin: "auto",},}}
      >
        {currentStyle.no}번 스타일에 기존 아이템 연결하기<button onClick={() => setIsExistingItemModalOpen(false)}>닫기</button><br/><br/>
        <img height='100px' src={currentStyle.pic} alt={`${currentStyle.no}번 스타일`} /><br/>
        <br/>
        <SearchForm>
          <SearchInput type="text" placeholder="아이템 이름을 입력하세요" onChange={onItemKeywordChange} 
          onFocus={() => {setShowItemDropdown(true); fetchItemData();}} 
          />
          {showItemDropdown && (
          <AutoSearchContainer>
          {filteredItems.map((item, index) => (
            <AutoSearchItem key={index}>
              {item.name} <img height='100px' src={item.pic} alt={`${item.name} 사진`} />
              <SearchButton onMouseDown={() => {addExistingItem(currentStyle.no, item.no); setIsExistingItemModalOpen(false);}}>연결하여 추가</SearchButton>
            </AutoSearchItem>
          ))}
          </AutoSearchContainer>
        )}
        </SearchForm>
      </Modal>
    </>
  );
}

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운의 위치를 제대로 설정하기 위해 추가 */
`;

const SearchInput = styled.input`
  font-family: inherit;
  font-size: inherit;
  background-color: white;
  border: none;
  color: #646464;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  width: 12em;
  transition: all ease-in-out 0.5s;
  margin-right: 0.5rem;

  &:hover,
  &:focus {
    box-shadow: 0 0 1em #00000013;
  }

  &:focus {
    outline: none;
    background-color: #f0eeee;
  }

  &::-webkit-input-placeholder {
    font-weight: 100;
    color: #ccc;
  }
`;

const SearchButton = styled.button`
  font-family: inherit;
  font-size: inherit;
  background-color: #323232;
  color: #fff;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #505050;
    cursor: pointer;
  }
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  width: 400px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 10px 10px rgb(0, 0, 0, 0.3);
  z-index: 3;
`;

const AutoSearchItem = styled.div`
  padding: 10px;
  cursor: default;  // 기본 커서로 변경하여 클릭할 수 없음을 표시
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;  // 클릭 이벤트를 무시
  display: flex;
  justify-content: space-between; // 버튼과 텍스트를 양쪽 끝에 배치
  align-items: center;
  button {
    pointer-events: all;  // 버튼은 클릭할 수 있게 설정
  }
`;