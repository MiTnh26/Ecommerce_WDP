import React, { useEffect, useRef, useState } from 'react'
import Footer from '../../layouts/Footer';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // change step
    const [email, setEmail] = useState(''); // store email
    const [message, setMessage] = useState(''); // notification error
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // store otp
    const [formPassword, setFormPassword] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate(); // chuyen trang
    const [resendTimer, setResendTimer] = useState(0); // store resend timer resend otp
    const timerRef = useRef(null);
    // handle box input email 
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    //Xu ly check email va gui ma otp 
    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        if (email) {
            try {
                const res = await axios.post("http://localhost:5000/customer/send-email",
                    { email: email },
                    { withCredentials: true });

                if (res.status === 200) {
                    setMessage('');
                    setStep(2);
                    // setTime sau 4p de co the gui lai otp
                    setResendTimer(240); // 4 phút
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => {
                        setResendTimer(prev => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
                return;
            } catch (error) {
                setMessage(error.response.data.message || 'Có lỗi xảy ra');
                console.log("error send email from fe", error);
            }
        }
    }
    const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Chưa hết 4 phút thì không gửi lại
    try {
        const res = await axios.post("http://localhost:5000/customer/send-email", 
            { email: email },
            { withCredentials: true });
        if (res.status === 200) {
            setMessage('Đã gửi lại mã xác minh');
            setResendTimer(240); // Reset lại 4 phút
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    } catch (error) {
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã');
    }
};
    // handle button navigate
    const handleNavigate = () => {
        // back lai trang truoc
        window.history.back();
    }

    // handle box input otp
    // xu ly focus() lan dau tien 
    const inputRefs = useRef([]);
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step])
    // xu ly ham change input otp
    const handleChange = (index, value) => {
        // Chi cho phép nhập số
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // lấy số cuối cùng "phong truong hop nhap nhanh"
        setOtp(newOtp);

        //Tu dong chuyen focus den input tiep theo
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }
    //xu ly ham xoa input otp
    const handleDelete = (index, e) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];

            if (otp[index]) {
                // nếu ô có giá trị xóa nó
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // nếu o rỗng, chuyển về o sau
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            }
        }
        // xu ly phim trai phai
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }
    //handleSubmitOtp
    const handleBackConfirmEmail = () => {
        setMessage('');
        setStep(1);
    }
    const handleSubmitOtp = async (e) => {
        const otpValue = otp.join('');
        if (otpValue.length !== otp.length) {
            setMessage('Vui lòng nhập đủ mã xác minh');
            return;
        }
        try {
            const res = await axios.post("http://localhost:5000/customer/verify-otp",
                { otp: otpValue },
                { withCredentials: true });

            if (res.status === 200) {
                setStep(3);
                setMessage('');
            }
            return;
        } catch (err) {
            setMessage(err.response.data.message || 'Có lỗi xảy ra');
        }

    }


    // Xu ly submit pasword
    //handle change password
    const handleChangePassword = (e) => {
        setFormPassword({
            ...formPassword,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();
        // Kiểm tra password trước khi gửi
        if (!formPassword.newPassword || !formPassword.confirmPassword) {
            setMessage('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (formPassword.newPassword !== formPassword.confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            const res = await axios.put("http://localhost:5000/customer/change-password",
                { newPassword: formPassword.newPassword },
                { withCredentials: true });
            if (res.status === 200) {
                setMessage('Đổi mật khóa thanh cong');
                setTimeout(() => {
                    navigate('/Ecommerce/login');
                }, 2000);
            }
        } catch (err) {
            console.log("Error changing password:", err);
            setMessage(err.response.data.message || 'Có lỗi xảy ra');
        }
    }
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, []);
    return (
        <div className='d-flex flex-column min-vh-100 container-fluid p-0 m-0'>
            <header>
                <div className="d-flex align-items-center p-3 shadow">
                    <a href="/" className="d-flex align-items-center text-decoration-none">
                        <img
                            src="/logo-ecommerce.jpg"
                            alt="Logo"
                            style={{ height: "40px", marginRight: "8px" }}
                        />
                    </a>
                    <span style={{ fontSize: "18px", marginLeft: "20px" }}>
                        {step === 1 && <>Xác Minh Email</>}
                        {step === 2 && <>Mã Xác Minh</>}
                        {step === 3 && <>Đổi Mật Khẩu</>}
                    </span>
                </div>
            </header>
            <main className="flex-fill container-fluid h0-75" style={{ height: "80vh" }}>
                <div className="d-flex justify-content-center align-items-center h-100">
                    {step === 1 && (
                        <div className="box shadow w-50 h-50 p-4">
                            <Button className="bg-transparent border-0" onClick={handleNavigate}><i className="fa-solid fa-arrow-left" style={{ color: "orange" }}></i></Button>
                            <h4 className="text-center">Đặt lại mật khẩu</h4>
                            <Form className="w-100 mt-4" onSubmit={handleSubmitEmail}>
                                <Form.Group>
                                    <Form.Control required type="email" placeholder="name@example.com" value={email} onChange={handleEmailChange} />
                                </Form.Group>
                                <Button type='submit' variant="warning w-100 mt-4">TIEP THEO</Button>
                                {message && <p className="text-danger text-center">{message}</p>}
                            </Form>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="box shadow w-50 h-70 p-4">
                            <Button className="bg-transparent border-0" onClick={handleBackConfirmEmail}><i className="fa-solid fa-arrow-left" style={{ color: "orange" }}></i></Button>
                            <h4 className="text-center p-0 m-0">Nhập mã xác nhận</h4>
                            <p className="fw-italic text-center p-0 m-0 mt-3">Mã xác minh được gửi đến Email</p>
                            <p className="email text-center">{email}</p>
                            <div className="d-flex justify-content-center gap-2 mb-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d{1}"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleDelete(index, e)}
                                        //   onPaste={handlePaste}
                                        className="form-control text-center fw-bold border-2"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            fontSize: '18px',
                                            borderRadius: '8px'
                                        }}
                                    //   disabled={isSubmitting}
                                    />
                                ))}
                            </div>
                            <p className="note text-center p-0 m-0 mt-1">
                                Bạn vẫn chưa nhận được mã?
                                {resendTimer > 0 ? (
                                    <span className="text-secondary"> Gửi lại ({Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')})</span>
                                ) : (
                                    <span className="text-danger" style={{ cursor: 'pointer' }} onClick={handleResendOtp}>Gửi lại</span>
                                )}
                            </p>
                            {message && <p className="text-danger text-center">{message}</p>}
                            <Button type='submit' variant="warning w-100 mt-3" onClick={handleSubmitOtp}>KẾ TIẾP</Button>
                        </div>)}

                    {step === 3 && (
                        <div className="box shadow w-50 h-50 p-4">
                            <h4 className="text-center">Đổi mật khẩu</h4>
                            <Form className="w-100 mt-4" onSubmit={handleSubmitChangePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control type="text" name="newPassword" value={formPassword.newPassword} onChange={handleChangePassword} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm password</Form.Label>
                                    <Form.Control type="text" name="confirmPassword" value={formPassword.confirmPassword} onChange={handleChangePassword} />
                                </Form.Group>
                                {message && <p className="text-danger text-center p-0 m-0">{message}</p>}
                                <Button type='submit' variant="warning w-100 mt-2">ĐỔI MẬT KHẨU</Button>
                            </Form>
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}

export default ForgotPasswordPage