
/* 
      Ít trang (≤ 5 trang) [1] [2] [3] [4] 
      Nhiều trang - ở đầu  [1] [2] [3] ... [10]
      Nhiều trang - ở giữa [1] ... [8] [9] [10] ... [20]
      Nhiều trang - ở cuối [1] ... [16] [17] [18] [19] [20]
      */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const delta = 2; // số trang hiển thị trước và sau trang hiện tại
  const range = [];
  const rangeWithDots = [];


  // Luôn bao gồm trang đầu tiên
  range.push(1, Math.min(totalPages, 1));
  // Luôn bao gồm trang cuối cùng
  if( totalPages > 1) {
    range.push(totalPages);
  }
  // Thêm các trang xung quanh trang hiện tại
  const addRange = (start, end) => {
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
  };
    addRange(
    Math.max(2, currentPage - delta),
    Math.min(totalPages - 1, currentPage + delta)
  );
  // Loại bỏ duplicates nếu có và sort
  const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

  // Thêm dots nếu cần
  for (let i = 0; i < uniqueRange.length; i++) {
    if (i === 0) {
      rangeWithDots.push(uniqueRange[i]);
    } else {
      // Nếu có khoảng cách > 1, thêm dots
      if (uniqueRange[i] - uniqueRange[i - 1] > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(uniqueRange[i]);
    }
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      {rangeWithDots.map((rangeItem, i) => (
        <button
          key={i}
          className={`btn border mx-1 d-flex align-items-center justify-content-center ${currentPage === rangeItem ? 'text-white bg-warning' : ''}`}
          disabled={typeof rangeItem !== 'number'}
          style={{ width: '35px', height: '35px' }}
          onClick={() => {
            if (typeof rangeItem === 'number' && rangeItem !== currentPage) {
              onPageChange(rangeItem);
            }
          }}
        >
          <span className="">{rangeItem}</span>
        </button>
      ))}
    </div>
  );
};

export default Pagination;
