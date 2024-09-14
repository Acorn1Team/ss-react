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
  const [newItemPic, setNewItemPic] = useState(null);
  const [itemKeyword, setItemKeyword] = useState(""); // 아이템 검색 입력값
  const [productKeyword, setProductKeyword] = useState(""); // 상품 검색 입력값
  const [productNo, setProductNo] = useState(); // 새로운 아이템 추가 시 연결할 상품 PK
  const [newItemName, setNewItemName] = useState(""); // 새로운 아이템 이름

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isExistingItemModalOpen, setIsExistingItemModalOpen] = useState(false);

  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentStyle, setCurrentStyle] = useState({});

  const [styleToDelete, setStyleToDelete] = useState(null); 
  const [isDeleteStyleModal, setIsDeleteStyleModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteItemModal, setIsDeleteItemModal] = useState(false);

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
  }, [no]);

  const getItems = (no) => {
    axios
      .get(`/admin/fashion/character/${no}/item`)
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onStyleFileChange = (e) => {
    setNewStyle(e.target.files[0]);
  };

  const onItemFileChange = (e) => {
    setNewItemPic(e.target.files[0]);
  };

  const onProductKeywordChange = (e) => {
    setProductKeyword(e.target.value);
    fetchProductData();
  };

  const onItemKeywordChange = (e) => {
    setItemKeyword(e.target.value);
    fetchItemData();
  };

  const fetchItemData = async () => {
    if (itemKeyword) {
      try {
        const response = await axios.get(
          `/admin/item/autocomplete/${itemKeyword}`
        );
        setFilteredItems(response.data);
      } catch (error) {
        console.error(`너가 입력한 ${itemKeyword}에서 못 가져오겠어: `, error);
        setFilteredItems([]);
      }
    } else {
      // 입력값 없을 때는 전체 목록을 가져온다.
      try {
        const response = await axios.get("/admin/item/autocomplete");
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
        const response = await axios.get(
          `/admin/product/autocomplete/${productKeyword}`
        );
        setFilteredProducts(response.data);
      } catch (error) {
        console.error(`너가 입력한 ${itemKeyword}에서 못 가져오겠어: `, error);
        setFilteredProducts([]);
      }
    } else {
      // 입력값 없을 때는 전체 목록을 가져온다.
      try {
        const response = await axios.get("/admin/product/autocomplete");
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("상품 못 가져오겠어: ", error);
        setFilteredProducts([]);
      }
    }
  };

  const onItemNameChange = (e) => {
    setNewItemName(e.target.value);
  };

  const addStyle = async () => {
    const styleForm = new FormData();
    styleForm.append("file", newStyle);

    await axios
      .post(`/admin/fashion/character/${no}/style`, styleForm, {
        headers: { "Content-Type": "multipart/form-data" },
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
  };

  const addExistingItem = async (style_no, item_no) => {
    try {
      // 아이템을 스타일에 연결
      await axios.post(`/admin/fashion/${style_no}/item/${item_no}`);

      // 아이템 리스트를 다시 불러오기
      const response = await axios.get(`/admin/fashion/character/${no}/item`);
      setItems(response.data);

      // 모달을 닫기
      setIsExistingItemModalOpen(false);
    } catch (error) {
      console.log("Error adding existing item:", error);
    }
  };

  const closeModal = () => {
    setIsExistingItemModalOpen(false);
    setIsNewItemModalOpen(false);
    setProductKeyword('');
    setProductNo();
  }

  const addItem = async () => {
    const itemForm = new FormData();
    itemForm.append("file", newItemPic);
    itemForm.append("product", productNo);
    itemForm.append("name", newItemName);

    try {
      await axios.post(`/admin/fashion/${currentStyle.no}/item`, itemForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const response = await axios.get(`/admin/fashion/character/${no}/item`);
      setItems(response.data);
      setItemKeyword('');
      setProductKeyword('');

      setIsNewItemModalOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const openDeleteStyleModal = (style) => {
    setStyleToDelete(style);
    setIsDeleteStyleModal(true);
  }

  const openDeleteItemModal = (item) => {
    setItemToDelete(item);
    setIsDeleteItemModal(true);
  }

  const deleteStyle = () => {
    axios
      .delete(`/admin/style/${styleToDelete.no}`)
      .then(
        axios
          .get(`/admin/fashion/character/${no}/style`)
          .then((response) => {
            setStyles(response.data);
            getItems(no);
          })
          .then(() => {
            setIsDeleteStyleModal(false)
          })
          .catch((error) => {
            console.log(error);
          })
      )
      .catch((err) => {
        console.log(err);
      });
  }

  const deleteItem = () => {
    axios
      .delete(`/admin/item/${itemToDelete.style}/${itemToDelete.no}`)
      .then(() => {
        getItems(no)
      })
      .then(() => {
        setIsDeleteItemModal(false)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!actorData) {
    return <p>상세 정보를 불러올 수 없습니다.</p>;
  }
  return (
    <div>
        <button style={{alignSelf:"left"}} className="cancel-button" onClick={() => navigate(-1)}>
          뒤로
        </button>
        <h2>{actorData.actor} ({actorData.character}) 스타일 편집
      </h2>
      <table style={{ flex: "2", margin: "0 auto", textAlign: "center", verticalAlign: "middle"}}>
        <thead>
          <tr>
            <th>스타일</th>
            <th>아이템1</th>
            <th>아이템2</th>
            <th>아이템3</th>
          </tr>
        </thead>
        <tbody>
          {styles.map((styleData, index) => {
            const filteredItems = items.filter(
              (item) => item.style === styleData.no
            ); // styleData.no와 일치하는 items 필터링
            return (
              <tr key={index}>
                <td>
                  <img
                    src={styleData.pic}
                    alt={`${index + 1}번 스타일`}
                    style={{ height: "180px", marginRight: "20px" }}
                  />
                  <br />
                  <button
                    className="delete-button"
                    onClick={() => {
                      openDeleteStyleModal(styleData);
                    }}
                  >
                    스타일 삭제
                  </button>
                </td>
                {[0, 1, 2].map((i) => (
                  <td key={i}>
                    {filteredItems[i] ? (
                      <>
                        {filteredItems[i].name}
                        <br />
                        <img
                          src={filteredItems[i].pic}
                          alt={`${index + 1}번 스타일 아이템${i + 1}`}
                          style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            marginRight: "20px",
                          }}
                        />
                        <br />
                        <button
                          className="delete-button"
                          onClick={() => openDeleteItemModal(filteredItems[i])}
                        >
                          아이템 삭제
                        </button>
                        <br />
                        <button
                          className="view-all-button"
                          onClick={() =>
                            navigate(
                              `/admin/product/update/${filteredItems[i].product}`
                            )
                          }
                        >
                          연결된 상품 조회
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="add-button"
                          onClick={() => {
                            setCurrentStyle(styleData);
                            setIsNewItemModalOpen(true);
                          }}
                        >
                          새로운 아이템으로 추가
                        </button>
                        <br />
                        <br />
                        <button
                          className="add-button"
                          onClick={() => {
                            setCurrentStyle(styleData);
                            setIsExistingItemModalOpen(true);
                          }}
                        >
                          기존 아이템으로 추가
                        </button>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td colSpan={4}>         
              스타일 추가하기<br />
              <input type="file" onChange={onStyleFileChange} ref={styleInputRef} /><br/>
              <button className="add-button" onClick={addStyle}>추가</button>
              </td>  
          </tr>
        </tbody>
      </table>

      <Modal
        isOpen={isNewItemModalOpen}
        onRequestClose={() => setIsNewItemModalOpen(false)}
        contentLabel="새로운 아이템 추가하기"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            maxHeight: "650px",
            margin: "auto",
          },
        }}
      >
        <img
          height="100px"
          src={currentStyle.pic}
          alt={`${currentStyle.no}번 스타일`}
        />
        <br />
        {currentStyle.no}번 스타일에 신규 아이템 연결하기
        <SearchForm>
          <SearchInput
            type="text"
            value={productKeyword}
            placeholder="연결할 상품명을 입력하세요"
            onChange={onProductKeywordChange}
            onFocus={() => {
              setShowProductDropdown(true);
              fetchProductData();
            }}
          />
          {showProductDropdown && (
            <AutoSearchContainer>
              {filteredProducts.map((product, index) => (
                <AutoSearchItem key={index}>
                  {product.name}{" "}
                  <img
                    height="100px"
                    src={product.pic}
                    alt={`${product.name} 사진`}
                  />
                  <SearchButton
                    onMouseDown={() => {
                      setProductNo(product.no);
                      setProductKeyword(product.name);
                      setShowProductDropdown(false);
                    }}
                  >
                    연결
                  </SearchButton>
                </AutoSearchItem>
              ))}
            </AutoSearchContainer>
          )}
        </SearchForm>
        <br />
        아이템 사진 <input type="file" onChange={onItemFileChange} />
        <br />
        아이템 이름 <input type="text" onChange={onItemNameChange} />
        <br /><br /><br /><br /><br /><br /><br />
        <button className="cancel-button" onClick={() => closeModal()}>닫기</button>&nbsp;&nbsp;
        <button className="add-button" onClick={addItem}>추가</button>
      </Modal>

      <Modal
        isOpen={isExistingItemModalOpen}
        onRequestClose={() => setIsExistingItemModalOpen(false)}
        contentLabel="기존 아이템 추가하기"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            maxHeight: "650px",
            margin: "auto",
          },
        }}
      >
        {currentStyle.no}번 스타일에 기존 아이템 연결하기
        <br />
        <br />
        <img
          height="100px"
          src={currentStyle.pic}
          alt={`${currentStyle.no}번 스타일`}
        />
        <br />
        <br />
        <SearchForm>
          <SearchInput
            type="text"
            placeholder="아이템 이름을 입력하세요"
            onChange={onItemKeywordChange}
            onFocus={() => {
              setShowItemDropdown(true);
              fetchItemData();
            }}
          />
          {showItemDropdown && (
            <AutoSearchContainer>
              {filteredItems.map((item, index) => (
                <AutoSearchItem key={index}>
                  {item.name}{" "}
                  <img
                    height="100px"
                    src={item.pic}
                    alt={`${item.name} 사진`}
                  />
                  <SearchButton
                    onMouseDown={() => {
                      addExistingItem(currentStyle.no, item.no);
                      setIsExistingItemModalOpen(false);
                    }}
                  >
                    연결하여 추가
                  </SearchButton>
                </AutoSearchItem>
              ))}
            </AutoSearchContainer>
          )}
        </SearchForm>
        <br />
        <button className="cancel-button" onClick={() => closeModal()}>닫기</button>
      </Modal>

      <Modal
        isOpen={isDeleteStyleModal}
        onRequestClose={() => setIsDeleteStyleModal(false)}
        contentLabel="스타일 삭제 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            height: "600px",
            margin: "auto",
          },
        }}
      >
        {styleToDelete ? (
          <>
            <h3>해당 스타일 및 연결된 아이템을 모두 삭제할까요?</h3>
            <img
              src={styleToDelete.pic}
              alt={`${styleToDelete.no} 이미지`}
              style={{ maxWidth: "70%", height: "auto", maxHeight:"60%" }}
            />
            <br /><br />
            <button className="delete-button" onClick={() => deleteStyle()}>삭제</button>
            &nbsp;&nbsp;
            <button className="cancel-button" onClick={() => setIsDeleteStyleModal(false)}>취소</button>
          </>
        ) : (
          <p>삭제할 스타일을 선택하세요.</p>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteItemModal}
        onRequestClose={() => setIsDeleteItemModal(false)}
        contentLabel="아이템 삭제 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            height: "600px",
            margin: "auto",
          },
        }}
      >
        {itemToDelete ? (
          <>
            <h3>해당 아이템을 이 스타일에서 삭제할까요?</h3>
            <img
              src={itemToDelete.pic}
              alt={`${itemToDelete.name} 이미지`}
              style={{ maxWidth: "70%", height: "auto", maxHeight:"60%" }}
            />
            <br /><br />
            <button className="delete-button" onClick={() => deleteItem()}>삭제</button>
            &nbsp;&nbsp;
            <button className="cancel-button" onClick={() => setIsDeleteItemModal(false)}>취소</button>
          </>
        ) : (
          <p>삭제할 아이템을 선택하세요.</p>
        )}
      </Modal>

    </div>
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
  cursor: default; // 기본 커서로 변경하여 클릭할 수 없음을 표시
  font-size: 14px;
  font-weight: bold;
  pointer-events: none; // 클릭 이벤트를 무시
  display: flex;
  justify-content: space-between; // 버튼과 텍스트를 양쪽 끝에 배치
  align-items: center;
  button {
    pointer-events: all; // 버튼은 클릭할 수 있게 설정
  }
`;
