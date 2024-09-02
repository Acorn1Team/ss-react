import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export default function PromotionPopup() {
    const navigate = useNavigate();
    const [locationCategory, setLocationCategory] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [path, setPath] = useState("");
    const [pic, setPic] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const changeInputValue = (e) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/admin/promotion/autocomplete/${locationCategory}/${inputValue}`);
                setFilteredItems(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setFilteredItems([]);
            }
        };
        if (locationCategory && inputValue) {
            fetchData();
        }
    }, [locationCategory, inputValue]);

    const selectPath = (item) => {
        setPath(`${locationCategory}/${item.no}`)
        setShowDropdown(false);
        setInputValue(item.name || item.title);
    }

    const changePopupFile = (e) => {
      setPic(e.target.files[0]);
    }

    const addPopup = () => {
      const formData = new FormData();
      formData.append("path", path);
      formData.append("pic", pic);
  
      axios
          .post("/admin/popup", formData, {
              headers: {
                  "Content-Type": "multipart/form-data",
              },
          })
          .then(() => {
            alert("추가 성공");
            navigate("/admin/promotion");
          })
          .catch((error) => {
              console.log(error);
          });
    };

    return (
        <div>
            <h2>팝업 등록</h2>
                <div>
                <input type="file" onChange={changePopupFile} /><br/><br/><br/>
                <SearchForm>
                <SearchSelect onChange={(e) => setLocationCategory(e.target.value)} value={locationCategory}>
                    <option value="">유도 경로 선택</option>
                    <option value="product">상품 페이지</option>
                    <option value="show">작품 등장인물 페이지</option>
                    <option value="character">캐릭터 페이지(회의 후 처리 예정)</option>
                </SearchSelect><br/><br/>
                <SearchInput placeholder='어디로?'
                    type="text"
                    value={inputValue}
                    onChange={changeInputValue}
                    onBlur={() => setShowDropdown(false)}
                    onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && (
                    <AutoSearchContainer>
                        {filteredItems.map((item, index) => (
                            <AutoSearchItem key={index} onMouseDown={() => selectPath(item)}>
                                {item.name || item.title}
                            </AutoSearchItem>
                        ))}
                    </AutoSearchContainer>
                )}
                </SearchForm>
                </div><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
            <button onClick={addPopup}>등록</button>
        </div>
    );
}

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

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운의 위치를 제대로 설정하기 위해 추가 */
`;

const SearchSelect = styled.select`
  font-family: inherit;
  font-size: inherit;
  background-color: #f4f2f2;
  border: none;
  color: #646464;
  padding: 0.7rem 1rem;
  border-radius: 30px;
  margin-right: 0.5rem;
  transition: all ease-in-out 0.5s;
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: calc(100% + 5px); /* 입력 필드 바로 아래에 위치하도록 설정 */
  left: 0;
  width: 30%; /* 입력 필드의 너비에 맞게 설정 */
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 10px 10px rgb(0, 0, 0, 0.3);
  z-index: 3;
`;

const AutoSearchItem = styled.div`
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  &:hover {
    background-color: #edf5f5;
  }
`;
