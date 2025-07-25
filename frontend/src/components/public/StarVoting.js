
const StarVoting = ({ rating }) => {
  return (
  
    <div className="star-rating position-relative" style={{ width: 'max-content' }}>
        {/* Lớp sao màu xám phía sau */}
        <div className="stars-background text-muted"
        style={{pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fa-solid fa-star fa-xs" style={{ padding: ' 0 2px'}}></i>
          ))}
        </div>
        {/* Lớp sao màu vàng phía trên */}
        <div
          className="stars-overlay text-warning position-absolute top-0 start-0 overflow-hidden"
          style={{ width: `${(rating / 5) * 100}%`, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {[...Array(5)].map((_, i) => (
            <i key={i} className="fa-solid fa-star fa-xs"style={{ padding: '0 2px'}}></i>
          ))}
        </div>
      </div>
  )
}

export default StarVoting