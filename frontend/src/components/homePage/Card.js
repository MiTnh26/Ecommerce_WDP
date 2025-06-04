import React from 'react'
import image from '../../assets/images/thumb-cucumber.png'
const Cart = (  ) => {
  return (
    <div className="card-custom rounded-3 p-3"
    style={{
      boxShadow: '0px 5px 22px rgba(0, 0, 0, 0.04)'
    }}>
  <div className="card-header-custom rounded-3 overflow-hidden">
    <div className="card-image-container bg-light" 
    style={{ aspectRatio: '1/1', position: 'relative' }}>
      <img 
        src={image} 
        alt=""
        className="w-100 h-100"
        style={{ objectFit: 'cover' }}
      />
    <div className="discord rounded-3"
      style={{
        position:'absolute',
        top: '10%',
        left: '5%',
        backgroundColor: "#a3be4c"
      }}
      ><p className='fw-bold text-white m-0 px-1'>30%</p></div> 
      <div className="heart border rounded-circle"
      style={{
        position:'absolute',
        top: '5%',
        right: '5%',
      }}
      >
        <i className="fa-regular fa-heart fs-4 p-2 m-0"></i>
      </div>
    </div>
  </div>
  <div className="card-body mt-2">
    <p className="card-title-custom fw-bold title">Sunstar Fresh Melon Juice</p>
    <div className="d-flex justify-content-between">
      <p className="price fw-bold">$18.00</p>
      <p className="rate text-warning"><i className="fa-solid fa-star"></i> 4.8</p>
    </div>
    {/* control */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button className="btn border border-muted p-0 m-0">
              <span className="text-muted fw-light p-1"
                style={{
                  fontSize: '24px',
                  lineHeight: '1',
                }}>-</span>
            </button>
            <p className="amount p-0 m-0 pt-1">1</p>
            <button className="btn border border-muted p-0 m-0">
              <span className="text-muted fw-light p-1"
                style={{
                  fontSize: '24px',
                  lineHeight: '1',
                }}>+</span>
            </button>
          </div>
          <button className="btn border-0">Add to Cart</button>
        </div>
      </div>
</div>
  )
}

export default Cart