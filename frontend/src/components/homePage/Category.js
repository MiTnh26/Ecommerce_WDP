import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
// default values trong es6 Component = CategoryItemDefault
const Category = ({ dataList, title, Component = CategoryItemDefault }) => {
    const [itemsPerView, setItemsPerView] = useState(2); // default với mobile = 2
    const [currentIndex, setCurrentIndex] = useState(0); // Tinh toan index slide hien tai và gia tri can truot
    console.log(dataList)
    // update items khi resize
    useEffect(() => {
        // set up 4 3 2
        const updateItemsPerView = () => {
            if (window.innerWidth >= 992) {
                setItemsPerView(4);
            } else if (window.innerWidth >= 768) {
                setItemsPerView(3);
            } else {
                setItemsPerView(2);
            }
        }
        updateItemsPerView();
        // them vao sk resite va go khi unmounted
        window.addEventListener("resize", updateItemsPerView)
        return () => window.removeEventListener("resize", updateItemsPerView)
    }, []) // dependence one mounted
    // Tinh toán số slide có thể trượt 
    const maxSlides = Math.max(0, dataList.length - itemsPerView);
    // Tinh toán phần trăm translateX cần trượt trái 
    const transformValue = -(currentIndex * (100 / itemsPerView))
    // xu ly next slide
    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxSlides));
    }
    // xu ly prev slide
    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }
    return (
        <>
            <div className="controls mb-2 d-flex justify-content-between">
                <p className="title h3">{title}</p>
                <div className="controls button d-flex align-items-center">
                    <p className="text-muted fw-bold p-0 m-0 me-3"> View All Category <i className="fa-solid fa-arrow-right text-muted"></i></p>                
                        <Button className={`bg-light rounded-2 border-0 ${currentIndex === 0 ? 'text-white' : 'text-black'}`} onClick={handlePrev} disabled={currentIndex === 0}>
                            {/* <i className="fa-solid fa-arrow-left"></i>*/} ❮
                        </Button>
                        <Button className={`bg-light rounded-2 border-0 text-black ms-1 ${currentIndex === maxSlides ? 'text-white' : 'text-black'}`} onClick={handleNext} disabled={currentIndex === maxSlides}>
                            {/* <i className="fa-solid fa-arrow-right"></i>*/} ❯
                        </Button>
                </div>
            </div>
            <div className="overflow-hidden py-3">
                <div
                    className="d-flex gap-3"
                    style={{
                        transform: `translateX(${transformValue}%)`,
                        transition: "transform 0.5s ease-in-out",
                    }}
                >
                    {dataList.length > 0 &&
                        dataList.map((item) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0"
                                style={{
                                    width: `calc(${100 / itemsPerView}% - 1rem)`,
                                }}
                            >
                                <Component item={item} />
                            </div>
                        ))
                    }
                </div>
            </div>
            {/* Dấu chấm hiển thị vị trí */}
          <div className=" d-flex justify-content-center my-3">
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <Button
                key={index}
                onClick={() => setCurrentIndex(index)}
                variant={index === currentIndex ? "primary" : "light"}
                
                className="rounded-circle mx-1 p-0"
                style={{aspectRatio: "1/1", width: "10px"}}            // đảm bảo không bị ép minWidth }}
              />
            ))}
          </div>
        </>
    );
}

export default Category;
export const CategoryItemDefault = ({ item }) => (
    <div
        className="border rounded-3 d-flex flex-column justify-content-center align-items-center"
        style={{
            aspectRatio: "5/3"
        }}>
        <div className="fs-1 mb-2">{item.icon}</div>
        <h5 className="fw-semibold mt-2">{item.title}</h5>
    </div>
)
