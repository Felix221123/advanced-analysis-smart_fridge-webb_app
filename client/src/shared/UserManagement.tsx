import { InventoryContainer, TabContainer } from '@/styles/components/shared.style'
import React, { useState } from 'react'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { UserModal } from '@/components/UserModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import AddUser from '@/assets/User_add.svg'
import { UserCard } from '@/components/UserCard'
import { useAuth } from '@/context/useAuth'


export const UserManagement: React.FC = () => {
    const { user } = useAuth();
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

                    {/* user account */}
                    <div className="stocksContainer">
                        <div className="scrollable">
                            {/* array user card listing here */}
                            <UserCard
                                full_name={user?.full_name ?? ''}
                                email={user?.email ?? ''}
                                role={user?.role ?? ''}
                                id={user?.id ?? ''}
                                onEdit={() => {}}
                                onRemove={() => {}}
                            />
                            <UserCard
                                full_name={user?.full_name ?? ''}
                                email={user?.email ?? ''}
                                role={'HEALTH_SAFETY_OFFICER'}
                                id={user?.id ?? ''}
                                onEdit={() => {}}
                                onRemove={() => {}}
                            />
                        </div>
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