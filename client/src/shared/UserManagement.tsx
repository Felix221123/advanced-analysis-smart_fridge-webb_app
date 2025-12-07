import { InventoryContainer, TabContainer } from '@/styles/components/shared.style'
import React, { useState } from 'react'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { UserModal } from '@/components/UserModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import AddUser from '@/assets/User_add.svg'



export const UserManagement: React.FC = () => {
    const [addUser, setAddUser] = useState<boolean>(false);






    return (
        <>
            <TabContainer>
                <InventoryContainer>
                    {/* heading of the inventory dashboard */}
                    <div className="heading">
                        <div className="tabHeader">
                            <SubHeader
                                text='User Management'
                                className='font-bold'
                            />
                            <Paragraph
                                text='Manager User access and permissions for the FFSmart System'
                            />
                        </div>
                        <AppButton
                            text='Add User'
                            variant='primary'
                            onClick={() => { setAddUser(true) }}
                            icon={<AddUserIcon />}
                        />
                    </div>
                </InventoryContainer>
            </TabContainer>



            {/* modal containers */}
            {addUser && <BodyOverlay />}
            {
                addUser && (
                    <UserModal
                        title='Add User'
                        description='Create a new user account with specific roles and permissions'
                        onClose={() => setAddUser(false)}
                        newUser={true}
                    />
                )
            }
        </>
    )
}




export const AddUserIcon = () => {
    return (
        <>
        <img src={AddUser} alt="add user icon" />
        </>
    )
}