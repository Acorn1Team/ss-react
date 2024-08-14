import AdminTop from "../AdminTop"

export default function FashionManage(){
    return(
        <>
            <AdminTop></AdminTop>
            작품명 검색: <input type="text" name="keyword" />
            <button>스크래핑 시도</button>
        </>
        
    )    
}