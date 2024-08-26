import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function StyleManage() {
  const { no } = useParams();
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(null);
  const [productInput, setProductInput] = useState('');
  const location = useLocation();
  const actorData = location.state;
  const navigate = useNavigate();
  const styleInputRef = useRef(null);

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

  const onProductInputChange = (e) => {
    setProductInput(e.target.value);
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
    itemForm.append('product', productInput);
    
    await axios
      .post(`/admin/fashion/${styleNo}/item`, itemForm, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      .then((response) => {
        setItems((prevItems) => [...prevItems, response.data]);
        setNewStyle(null);
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
                    : (<>아이템 추가하기<br/>
                      <input type="file" onChange={onItemFileChange} /><br/>
                      연결 상품 검색 <input type="text" onChange={onProductInputChange} /><br/>
                      <button onClick={() => {addItem(styleData.no)}}>추가</button></>)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

