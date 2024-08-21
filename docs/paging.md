# 페이징하는 법

페이징하는 법을 정리한 문서입니다.
예시 참고 : Posts.js (게시글 상세 보기) 의 댓글 페이징
예시 관련 서버 파일 : PostsModel, PostsContoller, CommentsRepository

검색 포함 페이징은 AdminProductModel, AdminProductContoller, ProductRepository (보현 작성)를 참고하세요.

## 클라이언트

페이징 기능을 추가하고 싶은 js 파일에 들어가서 아래 내용을 추가해 줍니다.
그대로 **복사/붙여넣기** 하신 후, Prettier로 정렬해 주세요.

### 1. useState

// 현재 페이지를 저장할 상태
const [currentPage, setCurrentPage] = useState(0);

// 페이지 크기를 저장할 상태
const [pageSize, setPageSize] = useState(10);

// 전체 페이지 수를 저장할 상태
const [totalPages, setTotalPages] = useState(1);

### 2. 데이터를 불러오는 axios.get 부분

axios.get(경로, {
params : { // 이 부분을 추가해야 합니다.
page: currentPage,
// 여기서 page는 보여 줄 페이지 번호입니다.
// 20개의 게시글을 5개로 나눠서 페이징할 경우, 첫 번째 페이지의 page 값은 0입니다.
size : 5,
// 몇 개를 기준으로 자를지 지정합니다.
}
}).then((res) => {
// 다른 데이터 처리...
setTotalPages(res.data.totalPages); // 이 부분을 추가해야 합니다.
})

### 3. 페이징 버튼 이벤트 함수

// 페이지 변경 함수
const handlePageChange = (newPage) => {
if (newPage >= 0 && newPage < totalPages) {
setCurrentPage(newPage);
getPostDetailInfo(); // 이 자리에 axios로 데이터를 불러오는 함수를 입력해 줍니다.
}
};

### 4. 페이징 처리 출력할 곳

<div style={{ marginTop: "10px" }}>
<button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} > 이전 </button>
<span style={{ margin: "0 10px" }}> {currentPage + 1} / {totalPages} </span>
<button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages} > 다음 </button>
</div>

## 서버

### 1. Dto

1-1. 페이징을 하고 싶은 자료의 Dto에 가서 아래 멤버필드를 추가해 줍니다.
ex) 댓글 페이징 -> CommentDto

private int totalPages, currentPage;
private Long totalElements;

### 2. Controller

2-1. 해당 @GetMapping 메소드의 반환값을 ResponseEntity로 감싸 줍니다.

- ResponseEntity : 응답의 상태 코드와 함께 응답 본문을 반환하기 위해 사용합니다.
  ex) PostDetailDto -> ResponseEntity<PostDetailDto>

2-2. 파라미터에 Pageable 타입의 pageable 를 추가해 줍니다.
Pageable : import org.springframework.data.domain.Pageable;
ex) public PostDetailDto postDetail(@PathVariable("no") int postNo)
-> public ResponseEntity<PostDetailDto> postDetail(@PathVariable("no") int postNo, Pageable pageable)

2-3. 페이징한 값을 저장해서 반환하기 위해 반환값 타입의 변수를 선언한 뒤, Model의 해당 메소드를 호출합니다.
ex) PostDetailDto postDetailPage = pm.postDetail(postNo, pageable);
return ResponseEntity.ok(postDetailPage);

2-3-1. 참고
파라미터의 Pageable pageable는 page, size, sort를 자동으로 바인딩합니다.
ResponseEntity.ok(postDetailPage) 는 postDetailPage가 성공적으로 처리되었음을 나타냅니다.

### 3. Model

3-1. Contoller에서 호출한 메소드의 반환값은 일반 Dto 입니다.

3-2. 페이징하고 싶은 데이터의 Entity를 Page로 감싼 변수를 선언합니다.
ex) Page<Comment> commentsPage;

3-3. 페이징 데이터를 불러올 수 있도록 Repository에 내용을 추가한 뒤, 반환값을 선언한 변수에 넣어 줍니다.

- Repository에 추가할 내용은 4-1번을 참고합니다.
  ex) commentsPage = crps.findByPostNo(postNo, pageable);

3-4. 반환값에 아래 값을 추가해 줍니다.
.totalPages(변수.getTotalPages())
.currentPage(변수.getNumber())
.totalElements(변수.getTotalElements())

- 여기서 변수 자리에 3-2번에서 선언한 변수 이름으로 교체합니다.

3-4-1. 이제 return 값 builder에는 페이징 자료가 담긴 3-2번에서 선언한 변수에서 가져옵니다.
ex) .no(변수.getNo())

### 4. Repository

4-1. 페이징을 위한 메소드를 선언합니다.

4-1-1. 원하는 반환값(Entity)을 Page로 감싸 줍니다.
ex) Comment -> Page<Comment>

- List가 아닌 Page 를 사용해야 페이징 정보를 함께 받습니다.

4-1-2. 메소드에 Pageable 파라미터를 추가합니다.
ex) public List<Comment> findByPostNo(int no) -> Page<Comment> findByPostNo(int postNo, Pageable pageable)

## 이제 해당하는 경로로 이동하여 결과를 확인합니다.
