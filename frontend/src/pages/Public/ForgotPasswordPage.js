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
    const navigate = useNavigate(); // navigate page
    const [resendTimer, setResendTimer] = useState(0); // store resend timer resend otp
    const timerRef = useRef(null);
    const [messRegex, setMessRegex] = useState('');
    // handle box input email 
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    //Handle check email and send otp code 
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
                    // setTime after 4 minutes to resend otp
                    setResendTimer(240); // 4 minutes
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
                setMessage(error.response.data.message || 'An error occurred');
                console.log("error send email from fe", error);
            }
        }
    }
    const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Not enough 4 minutes, do not resend
    try {
        const res = await axios.post("http://localhost:5000/customer/send-email", 
            { email: email },
            { withCredentials: true });
        if (res.status === 200) {
            setMessage('Verification code resent successfully');
            setResendTimer(240); // Reset 4 minutes
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
        setMessage(error.response?.data?.message || 'An error occurred while resending the code');
    }
};
    // handle button navigate
    const handleNavigate = () => {
        // go back to previous page
        window.history.back();
    }

    // handle box input otp
    // handle focus() first time 
    const inputRefs = useRef([]);
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step])
    // handle change input otp
    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // get last digit (in case of fast input)
        setOtp(newOtp);

        //Auto focus to next input
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }
    //handle delete input otp
    const handleDelete = (index, e) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];

            if (otp[index]) {
                // if input has value, delete it
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // if input is empty, move to previous input
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            }
        }
        // handle left/right arrow
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }
    //handle paste input otp
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');

        if (pastedData.length <= otp.length) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length && i < otp.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);

            // Focus to the last filled or next input
            const nextIndex = Math.min(pastedData.length, otp.length - 1);
            inputRefs.current[nextIndex]?.focus();
        }
    };
    //handleSubmitOtp
    const handleBackConfirmEmail = () => {
        setMessage('');
        setStep(1);
    }
    const handleSubmitOtp = async (e) => {
        const otpValue = otp.join('');
        if (otpValue.length !== otp.length) {
            setMessage('Please enter the full verification code');
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
            setMessage(err.response.data.message || 'An error occurred');
        }

    }


    // Handle submit password
    //handle change password
    const handleChangePassword = (e) => {
        setFormPassword({
            ...formPassword,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();
        // Check password before sending
        if (!formPassword.newPassword || !formPassword.confirmPassword) {
            setMessage('Please enter complete information');
            return;
        }
        if (formPassword.newPassword !== formPassword.confirmPassword) {
            setMessage('Confirmation password does not match');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (formPassword.newPassword) {
            const isValid = passwordRegex.test(formPassword.newPassword);
            if (!isValid) {
                setMessage("Must be at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character");
                return;
            }
        }
        try {
            const res = await axios.put("http://localhost:5000/customer/change-password",
                { newPassword: formPassword.newPassword },
                { withCredentials: true });
            if (res.status === 200) {
                setMessage('Password changed successfully');
                setTimeout(() => {
                    navigate('/Ecommerce/login');
                }, 2000);
            }
        } catch (err) {
            console.log("Error changing password:", err);
            setMessage(err.response.data.message || 'An error occurred');
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
                        {step === 1 && <>Email Verification</>}
                        {step === 2 && <>Enter Verification Code</>}
                        {step === 3 && <>Change Your Password</>}
                    </span>
                </div>
            </header>
            <main className="flex-fill container-fluid h0-75" style={{ height: "80vh" }}>
                <div className="d-flex justify-content-center align-items-center h-100">
                    {step === 1 && (
                        <div className="box shadow w-50 h-50 p-4">
                            <Button className="bg-transparent border-0" onClick={handleNavigate}><i className="fa-solid fa-arrow-left" style={{ color: "orange" }}></i></Button>
                            <h4 className="text-center">Reset Password</h4>
                            <Form className="w-100 mt-4" onSubmit={handleSubmitEmail}>
                                <Form.Group>
                                    <Form.Control required type="email" placeholder="name@example.com" value={email} onChange={handleEmailChange} />
                                </Form.Group>
                                <Button type='submit' variant="warning w-100 mt-4">NEXT</Button>
                                {message && <p className="text-danger text-center">{message}</p>}
                            </Form>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="box shadow w-50 h-70 p-4">
                            <Button className="bg-transparent border-0" onClick={handleBackConfirmEmail}><i className="fa-solid fa-arrow-left" style={{ color: "orange" }}></i></Button>
                            <h4 className="text-center p-0 m-0">Enter Verification Code</h4>
                            <p className="fw-italic text-center p-0 m-0 mt-3">Verification Code Sent to Email</p>
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
                                        onPaste={handlePaste}
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
                                Haven't received the code yet?
                                {resendTimer > 0 ? (
                                    <span className="text-secondary"> Resend ({Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')})</span>
                                ) : (
                                    <span className="text-danger" style={{ cursor: 'pointer' }} onClick={handleResendOtp}>Resend</span>
                                )}
                            </p>
                            {message && <p className="text-danger text-center">{message}</p>}
                            <Button type='submit' variant="warning w-100 mt-3" onClick={handleSubmitOtp}>Next</Button>
                        </div>)}

                    {step === 3 && (
                        <div className="box shadow w-50 h-70 p-4">
                            <h4 className="text-center">Change Password</h4>
                            <Form className="w-100 mt-4" onSubmit={handleSubmitChangePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control type="password" name="newPassword" value={formPassword.newPassword} onChange={handleChangePassword} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm password</Form.Label>
                                    <Form.Control type="password" name="confirmPassword" value={formPassword.confirmPassword} onChange={handleChangePassword} />
                                </Form.Group>
                                {message && <p className="text-danger text-center p-0 m-0">{message}</p>}
                                <Button type='submit' variant="warning w-100 mt-2">CHANGE PASSWORD</Button>
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