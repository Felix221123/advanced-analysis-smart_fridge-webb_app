import { PanelContainer } from '@/styles/components/Panel.style'
import React, { useState } from 'react'
import { MiniSubHeader, SubHeader } from './SubHeader'
import { useAuth } from '@/context/useAuth'
import { roleHeading, rolePanel } from '@/constants/roleHeading'
import { Paragraph } from './Paragraph'
import { AppButton } from './BaseButton'
import Alert from '@/assets/alert.svg'
import Logout from '@/assets/logout.svg'
import { useNavigate } from 'react-router-dom'
import { Loading } from './Loading'
import { BodyOverlay } from '@/styles/components/Loading.style'



export const Panel: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [log_out , setLogout] = useState<boolean>(false)

    // navigate to the login interface
    const handleNavigateToLogin = (route?: string) => {
        setLogout(true); 
    
        setTimeout(async() => {
            await logout();   
            navigate(`/${route || "login"}`);
        }, 2000);
    };
    

    return (
        <>
            <PanelContainer>
                <div className="panel">
                    <div className="logo">
                        <SubHeader
                            text='FFSmart Control Panel'
                            className='font-semibold'
                        />
                        <Paragraph
                            text={`${rolePanel[user?.role as keyof typeof rolePanel] ?? ''}`}
                            className='font-light'
                        />
                    </div>
                    <div className="profile">
                        <AppButton
                            text='Alerts'
                            icon={<AlertIcon />}
                            variant="outline"
                        />
                        <div className="userProfile">
                            <MiniSubHeader
                                text={user?.full_name}
                                className='font-semibold'
                            />
                            <Paragraph
                                text={`${roleHeading[user?.role as keyof typeof roleHeading] ?? ''}`}
                            />
                        </div>
                        <AppButton
                            text='Logout'
                            icon={<LogoutIcon />}
                            variant="outline"
                            onClick={() => handleNavigateToLogin('login')}
                        />
                    </div>
                </div>
            </PanelContainer>

            {log_out && <Loading />}
            {log_out && <BodyOverlay />}
        </>
    )
}




// alert button
export const AlertIcon = () => {
    return (
        <>
            <img src={Alert} alt="alert icon" />
        </>
    )
}

// logout button
export const LogoutIcon = () => {
    return (
        <>
            <img src={Logout} alt="logout icon" />
        </>
    )
}