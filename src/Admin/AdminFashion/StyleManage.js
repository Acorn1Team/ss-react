import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";

export default function StyleManage() {
  const { no } = useParams();
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(null);
  const [productKeyword, setProductKeyword] = useState('');
  const [itemKeyword, setItemKeyword] = useState('');
  const [itemInput, setItemName] = useState('');
  const location = useLocation();
  const actorData = location.state;
  const navigate = useNavigate();
  const styleInputRef = useRef(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isExistingItemModalOpen, setIsExistingItemModalOpen] = useState(false);
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
  }

  const onItemKeywordChange = (e) => {
    setItemKeyword(e.target.value);
  }

  const onItemNameChange = (e) => {
    setItemName(e.target.value);
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

  const addItem = async(styleNo) => {
    const itemForm = new FormData();
    itemForm.append('file', newItem);
    itemForm.append('product', productKeyword);
    
    await axios
      .post(`/admin/fashion/${styleNo}/item`, itemForm, {
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
          {styles.map((styleData, index) => {
            // styleData.no와 일치하는 items 필터링
            const filteredItems = items.filter(item => item.style === styleData.no);

            return (
              <tr key={index}>
                <td><img src={styleData.pic} alt={`${index + 1}번 스타일`} /></td>
                {[0, 1, 2].map((i) => (
                  <td key={i}>
                    {filteredItems[i] ? 
                      (<><img src={filteredItems[i].pic} alt={`${index}번 스타일 아이템${i+1}`} />
                      <br/><button onClick={() => navigate(`/admin/product/detail/${filteredItems[i].product}`)}>유사상품 조회하기</button></>) 
                    : (<>
                          <button onClick={() => {
                            setCurrentStyle(styleData);  // Set the current style number
                            setIsNewItemModalOpen(true);
                          }}>🛍️새로운 아이템으로 추가하기🛍️</button>
                          <br/><br/>
                          <button onClick={() => {
                            setCurrentStyle(styleData);  // Set the current style number
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
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            margin: "auto",
          },
        }}
      >
        <img height='100px' src={currentStyle.pic} alt={`${currentStyle.no}번 스타일`} /><br/>
        {currentStyle.no}번 스타일에 신규 아이템 연결하기<hr/>
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
            <tr>
              <td>연결 상품 검색</td>
              <td><input type="text" onChange={onProductKeywordChange} /></td>
            </tr>
          </tbody>
        </table>
        <button onClick={() => addItem}>추가</button><hr/>
        <button onClick={() => setIsNewItemModalOpen(false)}>닫기</button>
      </Modal>

      <Modal
        isOpen={isExistingItemModalOpen}
        onRequestClose={() => setIsExistingItemModalOpen(false)}
        contentLabel="기존 아이템 추가하기"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            margin: "auto",
          },
        }}
      >
        <img height='100px' src={currentStyle.pic} alt={`${currentStyle.no}번 스타일`} /><br/>
        {currentStyle.no}번 스타일에 기존 아이템 연결하기<hr/>
        아이템 검색 <input type="text" onChange={onItemKeywordChange} /><br/>
        <button onClick={() => setIsExistingItemModalOpen(false)}>닫기</button>
      </Modal>
    </>
  );
}
