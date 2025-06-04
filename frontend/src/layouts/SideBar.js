import React from 'react'
import { Dropdown, Button } from 'react-bootstrap'

const SideBar = () => {
    return (
        <div className="sidebar mt-4">     
            {/* Button hidden on lg */}
            <Button variant="outline-secondary" className='d-block d-lg-none mx-auto mx-md-3 mx-sm-5'><i className="fa-solid fa-bars"></i></Button>
            {/* List menu */}
            <div className="d-lg-flex gap-5 justify-content-start align-items-center d-none ">
                <Dropdown>
                    <Dropdown.Toggle variant="transparent" id="dropdown-basic">
                        Shop by Departments
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <p className="p-0 m-0">Women</p>
                <p className="p-0 m-0">Men</p>
                <p className="p-0 m-0">Kids</p>
                <p className="p-0 m-0">Accessories</p>
                <Dropdown>
                    <Dropdown.Toggle variant="transparent" id="dropdown-basic">
                        Page
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <p className="p-0 m-0">Brand</p>
                <p className="p-0 m-0">Sale</p>
                <p className="p-0 m-0">Blog</p>
            </div>

        </div>
    )
}

export default SideBar