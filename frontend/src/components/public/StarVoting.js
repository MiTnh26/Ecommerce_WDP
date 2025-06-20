
const StarVoting = ({rating}) => {
  return (
   <div className="rating-stars position-relative">
                  {/* Lớp sao màu xám phía sau */}
                  <div className="stars-background text-muted white-space-nowrap">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star fa-xs"></i>
                    ))}
                  </div>
                  {/* Lớp sao màu vàng phía trên */}
                  <div
                    className="stars-overlay text-warning position-absolute top-0 start-0 overflow-hidden white-space-nowrap"
                    style={{ width: `${(rating / 5) * 100}%`, pointerEvents: 'none' }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star fa-xs"></i>
                    ))}
                  </div>
                </div>
  )
}

export default StarVoting