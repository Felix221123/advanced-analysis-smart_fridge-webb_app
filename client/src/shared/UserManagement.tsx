import { InventoryContainer, TabContainer } from '@/styles/components/shared.style'
import React, { useCallback, useEffect, useState } from 'react'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { UserModal } from '@/components/UserModal'
import AddUser from '@/assets/User_add.svg'
import { UserCard } from '@/components/UserCard'
import { useAuth } from '@/context/useAuth'
import { DeleteModal } from '@/components/DeleteModal'
import { AllUsersApi } from '@/packages/api/UserApi'
import { BodyOverlay } from '@/styles/components/Loading.style'

const ALL_USERS_KEY = "allUsers";

type UserRow = {
    id: string;
    email: string;
    full_name: string;
    role: string;
    restaurant_id: string;
    is_active: boolean;
};

const readUsersCache = (): UserRow[] => {
    try {
        const raw = localStorage.getItem(ALL_USERS_KEY);
        return raw ? (JSON.parse(raw) as UserRow[]) : [];
    } catch {
        return [];
    }
};

const writeUsersCache = (users: UserRow[]) => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
};

// Handles different possible API shapes: array OR { users: [] } OR { data: [] }
const normaliseUsersResponse = (res: any): UserRow[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.users)) return res.users;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};




export const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [addUser, setAddUser] = useState<boolean>(false);
    const [removeUser, setRemoveUser] = useState<boolean>(false);


    const [users, setUsers] = useState<UserRow[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);

    // inside UserManagement component

    const [editUserOpen, setEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState<string>('');


    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError(null);

        try {
            const res = await AllUsersApi();
            const list = normaliseUsersResponse(res);

            const activeOnly = list.filter((u) => u.is_active === true);

            setUsers(activeOnly);
            writeUsersCache(activeOnly);
        } catch (err: any) {
            setUsersError(err?.message || err?.detail || "Could not load users.");
        } finally {
            setUsersLoading(false);
        }
    }, []);


    useEffect(() => {
        const cached = readUsersCache().filter((u) => u.is_active === true);
        if (cached.length) setUsers(cached);

        fetchUsers();
    }, [fetchUsers]);




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
                            {usersError && (
                                <p style={{ color: "red", marginBottom: "10px" }} className="text-sm">
                                    {usersError}
                                </p>
                            )}

                            {usersLoading && users.length === 0 && (
                                <p className="text-sm">Loading users...</p>
                            )}

                            {/* Render all users from API/cache */}
                            {users.map((u) => (
                                <UserCard
                                    key={u.id}
                                    full_name={u.full_name}
                                    email={u.email}
                                    role={u.role}
                                    id={u.id}
                                    onEdit={() => {
                                        setSelectedUser(u);
                                        setEditUserOpen(true);
                                    }}
                                    onRemove={() => {
                                        setSelectedUserIdToDelete(u.id);
                                        setRemoveUser(true);
                                    }}
                                />
                            ))}

                            {users.length === 0 && user && !usersLoading && (
                                <UserCard
                                    full_name={user.full_name}
                                    email={user.email}
                                    role={user.role}
                                    id={user.id}
                                    onEdit={() => { }}
                                    onRemove={() => setRemoveUser(true)}
                                />
                            )}
                        </div>
                    </div>
                </InventoryContainer>
            </TabContainer>



            {/* modal containers */}
            {addUser && <BodyOverlay />}
            {editUserOpen && <BodyOverlay />}
            {removeUser && <BodyOverlay />}

            {
                addUser && (
                    <UserModal
                        title='Add User'
                        description='Create a new user account with specific roles and permissions'
                        onClose={() => setAddUser(false)}
                        newUser={true}
                        onSuccess={() => {
                            // refetch user
                            fetchUsers();
                        }}
                    />
                )
            }

            {editUserOpen && selectedUser && (
                <UserModal
                    title="Edit User"
                    description="Update user’s account details, role and access. You can leave the inputs as it's if you do not want to change anything."
                    onClose={() => {
                        setEditUserOpen(false);
                        setSelectedUser(null);
                    }}
                    newUser={false}
                    selectedUserId={selectedUser.id}
                    initialValues={{
                        full_name: selectedUser.full_name,
                        email: selectedUser.email,
                        role: selectedUser.role,
                        restaurant_id: selectedUser.restaurant_id,
                        is_active: selectedUser.is_active,
                    }}
                    onSuccess={() => {
                        fetchUsers();
                    }}
                />
            )}



            {removeUser && selectedUserIdToDelete && (
                <DeleteModal
                    container='user'
                    targetId={selectedUserIdToDelete}
                    onClose={() => {
                        setRemoveUser(false);
                        setSelectedUserIdToDelete('');
                    }}
                    onSuccess={() => {
                        fetchUsers();
                    }}
                />
            )}
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