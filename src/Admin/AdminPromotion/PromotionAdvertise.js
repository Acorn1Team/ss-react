import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export default function PromotionAdvertise() {
    const navigate = useNavigate();
    const [locationCategory, setLocationCategory] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [state, setState] = useState({});
    const [filteredItems, setFilteredItems] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

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
        setState(prevState => ({ ...prevState, path: `${locationCategory}/${item.no}` }))
        setShowDropdown(false);
        setInputValue(item.name || item.title);
    }

    const addAdvertise = () => {
        console.log('추가할 상태', state)
        axios
            .post("/admin/advertise", state)
            .then((response) => {
                if (response.data.isSuccess) {
                    alert("추가 성공");
                    navigate("/admin/promotion");
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <h2>광고 알림 등록</h2>
                <label>유도 경로</label>
                <select onChange={(e) => setLocationCategory(e.target.value)} value={locationCategory}>
                    <option value="">종류를 선택하세요</option>
                    <option value="product">상품 페이지</option>
                    <option value="show">작품 등장인물 페이지</option>
                    <option value="character">캐릭터 페이지(회의 후 처리 예정)</option>
                </select>
                <SearchInput
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
                <div>
                <label>광고 내용</label>
                <textarea name="content" onChange={handleChange} />
                <input type="text" name="path" onChange={handleChange} hidden />
                </div>
            <button onClick={addAdvertise}>등록</button>
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

const AutoSearchContainer = styled.div`
  position: absolute;
  top: 250px;
  left: 280px;
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
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  &:hover {
    background-color: #edf5f5;
  }
`;
