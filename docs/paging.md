# 페이징 처리하기

해당 문서는 페이징 처리를 위해 작성되었습니다.  
일반 페이징과 검색 페이징의 처리가 다르므로 유의해서 복사 / 붙여넣기 해 주세요.

## 1. 클라이언트

### 1-1. useState 선언

#### 1-1-1. 일반 페이징의 경우

```
  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);
```

#### 1-1-2. 검색 페이징의 경우

```
  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  // 검색어
  const [searchTerm, setSearchTerm] = useState("");

  // 검색 필드
  const [searchField, setSearchField] = useState("userId");

  // 추가적으로, 정보를 가져오는 useState 외 filter를 위한 useState를 하나 더 선언합니다. 아래는 예시입니다.
  const [filterData, setFilterData] = useState([]);

```

### 1-2. axios.get 에 params 추가

#### 1-2-1. 일반 페이징의 경우

```
axios.get(`/path`, {
    params : {
        page : currentPage,
        size : pageSize
    },
}).then((res) => {
    // 데이터 로직 처리...
    setTotalPages(res.data.totalPages);
}).catch((err) => {
    console.log(err);
})
```

#### 1-2-2. 검색 페이징의 경우

**날짜 검색의 경우** Admin/AdminProduct/ProductManage 를 참고합니다.

```
axios.get(`/path`, {
    params : {
        page : currentPage,
        size : pageSize,
        searchTerm : searchTerm,
        searchField : searchField,
    },
}).then((res) => {
    // 데이터 로직 처리...
    setTotalPages(res.data.totalPages);
}).catch((err) => {
    console.log(err);
})
```

### 1-3. 처리를 위한 핸들러 함수 추가

#### 1-3-1. 일반 페이징의 경우

```
  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };
```

#### 1-3-2. 검색 페이징의 경우

```
// 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

   const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchTerm("");
    setFilterData(orders); // 예시이므로 선언한 filter 변수 이름으로 변경합니다.
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders(0, pageSize, searchTerm, searchField);
    // 예시이므로 1-2 에서 지정한 데이터를 가져오는 함수 이름으로 변경해 줍니다.
  };

  const handleReset = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSearchField("");
    fetchOrders(0, pageSize);
    // 예시이므로 1-2 에서 지정한 데이터를 가져오는 함수 이름으로 변경해 줍니다.
  };
```

### 1-4. 페이징 상호작용 버튼 / jsx 부분

```
 {totalPages > 1 && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages || loading}
          >
            다음
          </button>
        </div>
      )}
```

#### 검색 페이징의 경우 추가 처리가 필요합니다.

- 검색 분류 SELECT

```
 검색 :
<select value={searchField} onChange={handleSearchFieldChange}>
    // <option></option>
</select>
```

- 검색 버튼 button

```
<button onClick={handleSearch}>검색</button>
```

- 전체 보기 button

```
<button onClick={handleReset}>전체 보기</button>
```

## 2. 서버

일반 페이징 처리 방법을 서술합니다.  
검색 페이징의 경우, **보현** 님이 작성한 AdminProductContoller, AdminProductModel 을 참고하세요.

### 2-1. 반환값이 단일 Dto인 경우 (특정 페이지만을 위해 생성한 커스텀 Dto일 경우)

예시 : 게시글 상세보기의 댓글 페이징
예시 파일 : Posts.js / PostsModel, PostsController, CommentsRepository, PostsDetailDto

#### 2-1-1. Dto

```
private int totalPages, currentPage;
private Long totalElements;
// 커스텀 Dto의 멤버필드로 추가합니다.
```

#### 2-1-2. Repository

```
public Page<Comment> findByPostNo(int postNo, Pageable pageable);
// 반환값은 Page<Entity> 입니다.
// 파라미터에 Pageable pageable을 추가해 줍니다.
```

#### 2-1-3. Model

```
public PostDetailDto postDetail(int postNo, Pageable pageable) {
// 메소드 반환값은 해당 Dto 그대로 기재해 줍니다.
// 파라미터에 Pageable pageable를 추가합니다.

    PostDto postInfo = Post.toDto(prps.findById(postNo).get());
    UserDto userInfo = User.toDto(urps.findById(postInfo.getUserNo()).get());
    // 커스텀 Dto 특성상 여러 테이블의 정보가 들어가기 때문에, 페이징 처리를 하기 위한 데이터 작업이 아니라면 일반적인 방법으로 불러옵니다.

    Page<Comment> commentsPage = crps.findByPostNo(postNo, pageable);
    // 페이징 처리를 위한 항목은 Page<Entity> 반환값으로 지정하고, 2-1-2 에서 생성한 Repository의 메소드를 지정합니다. 또한 pageable을 인자로 추가합니다.

    return PostDetailDto.builder()
        .posts(postInfo)
        .userPic(userInfo.getPic())
        // 생략...
        .comments(commentsPage.getContent().stream().map(Comment::toDto).collect(Collectors.toList()))
        // Page 반환값을 Dto로 변환합니다.
        .totalPages(commentsPage.getTotalPages())
        // 전체 페이지 수
        .currentPage(commentsPage.getNumber())
        // 현재 페이지 번호
        .totalElements(commentsPage.getTotalElements())
        // 총 댓글 수
        .build();
	}
```

#### 2-1-4. Contoller

```
@GetMapping("/posts/detail/{no}")
	public ResponseEntity<PostDetailDto> postDetail(@PathVariable("no") int postNo, Pageable pageable) {
    // 기존 반환값 (커스텀 Dto) 을 ResponseEntity로 감싸 줍니다.
    // pageable 은 별도의 어노테이션 없이 자동으로 매핑됩니다.

		PostDetailDto postDetailPage = pm.postDetail(postNo, pageable);
        // 2-1-3 에서 생성한 메소드의 값을 커스텀 Dto 반환값으로 받아 줍니다.

		return ResponseEntity.ok(postDetailPage);
        // ResponseEntity.ok() : 성공적인 반환임을 함께 전송합니다.
	}
```

### 2-2. 반환값이 List<Dto>인 경우

예시 : 공지 목록 페이징
예시 파일 : Notice.js / NoticesRepository, UserController, UserModel, NoticeDto

#### ~~2-2-1. Dto~~

추가 항목 없음.

#### 2-2-2. Repository

```
public Page<Notice> findAll(Pageable pageable);
// 반환값은 Page<Entity> 입니다.
// 파라미터에 Pageable pageable을 추가하고, findByNo 와 같은 파라미터가 필요한 메소드라면 함께 추가해 줍니다.
```

#### 2-2-3. Model

```
public Page<NoticeDto> getNoticeList(Pageable pageable) {
    // 메소드 반환값은 Page<Dto> 입니다.

    Page<Notice> noticePage = nrps.findAll(pageable);
    // 결과값을 저장할 Page<Entity> 변수를 선언하고, 2-2-2 에서 생성한 Repository 메소드 결과값을 담아 줍니다.

    return noticePage.map(Notice::toDto);
      // Entity 반환값을 Dto로 변환하여 return 합니다.
	}
```

#### 2-2-4. Contoller

```
@GetMapping("/user/notice")
public ResponseEntity<Page<NoticeDto>> getNoticeList(Pageable pageable) {
    // 반환값을 ResponseEntity<Page<Dto>> 로 지정해 줍니다.

    Page<NoticeDto> noticePage = um.getNoticeList(pageable);
    // 2-2-3 에서 생성한 메소드의 값을 Page<Dto> 타입 변수로 받아 줍니다.

    return ResponseEntity.ok(noticePage);
    // ResponseEntity.ok() : 성공적인 반환임을 함께 전송합니다.
}
```

### 2-3. 반환값이 List<Dto>고, pk List로 반복문을 사용해 구현한 경우

예시 : 쿠폰 페이징
예시 파일 : Coupon.js / MyPageModel, CouponDto, MyPageContoller, CouponRepository

#### 2-3-1. Dto

```
private int totalPages, currentPage;
private Long totalElements;
```

#### 2-3-2. Repository

```
public Page<Coupon> findByNoIn(List<Integer> couponNoList, Pageable pageable);
// 반환값은 Page<Entity> 입니다.
// findByNoIn 은 Entity에서 no 값이 couponNolist List<Integer> 안에 포함되어 있는 값들을 리턴합니다.
```

#### 2-3-3. Model

```
public Page<CouponDto> getCouponData(int userNo, Pageable pageable) {
    // 반환값은 Page<Dto> 입니다.

    List<Integer> couponNoList = cpurps.findByUserNo(userNo).stream().map(CouponUser::getNo).collect(Collectors.toList());
    // List<Integer> 타입의 변수를 선언하여 데이터를 얻고자 하는 테이블의 PK를 Integer List로 받아 담아 줍니다.
    // 예시의 경우, Coupon 테이블에서 특정 유저가 가지고 있는 쿠폰을 출력하기 위해 CouponUser 테이블 (Coupon과 User의 관계 테이블) 에서 유저를 검색하여, 가지고 있는 쿠폰의 PK를 List<Integer> 타입으로 받아 준 것입니다.

    Page<Coupon> couponPage = cprps.findByNoIn(couponNoList, pageable);
    // Page<Entity> 타입의 변수를 선언하여 2-3-2에서 생성한 Repository의 메소드 반환값을 담아 줍니다.

    List<CouponDto> couponDtoList = couponPage.stream().map(Coupon::toDto).collect(Collectors.toList());
    // List<Dto> 타입의 변수를 선언하여 위에서 선언한 메소드 반환값 변수를 Dto로 변환하여 담아 줍니다.

    return new PageImpl<>(couponDtoList, pageable, couponPage.getTotalElements());
    // PageImpl을 사용하여 값들을 담습니다.
}
```

#### 2-3-4. Contoller

이는 2-2-4(반환값이 List<Dto>인 경우) 와 동일합니다.

```
@GetMapping("/alert/{no}")
public ResponseEntity<Page<AlertDto>> myAlert(@PathVariable("no") int userNo, Pageable pageable) {
    // 반환값을 ResponseEntity<Page<Dto>> 로 지정해 줍니다.

    Page<AlertDto> alertPage = mm.myAlert(userNo, pageable);
    // 2-2-3 에서 생성한 메소드의 값을 Page<Dto> 타입 변수로 받아 줍니다.

    return ResponseEntity.ok(alertPage);
    // ResponseEntity.ok() : 성공적인 반환임을 함께 전송합니다.
}
```
