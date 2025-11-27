import React, { useState } from 'react'
import { LoginPage } from '@/styles/components/Login.style'
import LoginIllustration from '@/assets/login_illustration.svg'
import { Header } from '@/components/Header'
import { Input } from '@/components/Input'
import Email from '@/assets/email.svg'
import { useNavigate } from 'react-router-dom'
import Password from '@/assets/password.svg'
import { AuthButton } from '@/components/BaseButton'
import { useAuth } from '@/context/useAuth'
import { LogInApi } from '@/packages/api/LogInApi'
import { LoginRequestProps } from '@/interface/UserProps'
import { Loading } from '@/components/Loading'
import { BodyOverlay } from '@/styles/components/Loading.style'
import { roleRoutes } from '@/constants/roleRoutes'


export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginRequestProps>({
        email: "",
        password: "",
    });

    // SINGLE error + loading states
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Handle form field change
    const handleChange = (field: "email" | "password", value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // handle navigation to login page
    const handleNavigation = (route: string | undefined) => {
        if (route === undefined) {
            route = 'login';
        }
        navigate(`/${route}`);
    };

    // handle form submission for login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await LogInApi(form);

            login(res);

            const userRole = res.role;
            const targetRoute = roleRoutes[userRole];

            if (!targetRoute) {
                throw new Error("Unknown role. Contact admin.");
            }

            setTimeout(() => {
                handleNavigation(targetRoute);
            }, 1200);
        } catch (err: any) {
            setError(err?.message || "Login failed. Try again.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <LoginPage>
                <Header
                    text='FFSmart Fridge Management'
                    className='text-center mb-10'
                />
                <div className="container">
                    <div className="leftSection">
                        <img src={LoginIllustration} alt="login illustration set" />
                    </div>
                    <div className="rightSection">
                        <Header
                            text='Welcome Back'
                            className='headingText'
                        />
                        <form onSubmit={handleSubmit}>
                            <div style={{ width: "400px" }}>
                                <Input
                                    placeholder="Email Address"
                                    icon={<EmailIcon />}
                                    type='text'
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                />
                            </div>
                            <div style={{ width: "400px" }}>
                                <Input
                                    placeholder="Password"
                                    icon={<PasswordIcon />}
                                    type='password'
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                />
                            </div>
                            {error && <p style={{ color: "red", marginBottom: "10px" }} className='text-sm'>{error}</p>}
                            <AuthButton
                                text='Log In'
                                onClick={() => { }}
                                type='submit'
                                disabled={loading}
                            />
                        </form>
                    </div>
                </div>
            </LoginPage>

            {loading && <Loading />}
            {loading && <BodyOverlay />}
        </>
    )
}



export const EmailIcon: React.FC = () => {
    return (
        <>
            <img src={Email} alt="email icon" />
        </>
    )
}

export const PasswordIcon: React.FC = () => {
    return (
        <>
            <img src={Password} alt="password icon" />
        </>
    )
}