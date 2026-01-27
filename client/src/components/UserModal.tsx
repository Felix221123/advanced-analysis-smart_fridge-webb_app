import React, { useEffect, useState } from 'react'
import { UserModalProps } from '@/interface/ComponentProps'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import {
    ModalContainer,
    UserModalContainer
} from '@/styles/components/Modal.style'
import closeBtn from '@/assets/closeBtn.svg'
import { Input } from './Input'
import { AppButton } from './BaseButton'
import CustomSelect, { ObjectSelectOptions } from './CustomSelect'
import { restaurants, roleHeading } from '@/constants/roleHeading'
import { CreateUserProps, UpdateUserProp } from '@/interface/UserProps'
import { CreateUserApi, UpdateUserApi } from '@/packages/api/UserApi'
import { MessageSuccess } from './MessageModal'




export const UserModal: React.FC<UserModalProps> = ({
    title, description, onClose, newUser, onSuccess, selectedUserId, initialValues
}) => {
    const [user, setUser] = useState<CreateUserProps>({
        full_name: '',
        email: '',
        role: '',
        is_active: false,
        restaurant_id: '',
        password: ''
    })

    // SINGLE error + loading states
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    // Handle form field change
    const handleChange = (field: keyof CreateUserProps, value: string | boolean) => {
        setUser((prev) => ({ ...prev, [field]: value }));
    };

    // Pre-fill when editing
    useEffect(() => {
        if (newUser) return;
        if (!initialValues) return;

        setUser((prev) => ({
            ...prev,
            full_name: initialValues.full_name ?? '',
            email: initialValues.email ?? '',
            role: initialValues.role ?? '',
            is_active: initialValues.is_active ?? true,
            restaurant_id: initialValues.restaurant_id ?? '',
            password: ''
        }));
    }, [newUser, initialValues]);


    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess(false);
            onClose()
        }, 8500);

        return () => clearTimeout(timer);
    }, [success, onClose]);


    useEffect(() => {
        console.log("form updated:", user);
    }, [user]);


    // handle form submission for login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setSuccess(false);

        try {
            if (newUser) {
                const my_form = {
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    is_active: true,
                    restaurant_id: user.restaurant_id,
                    password: '221123'
                };

                const res = await CreateUserApi(my_form);
                if (res) {
                    setSuccess(true);
                    onSuccess?.();
                }
            } else {
                if (!selectedUserId) {
                    throw new Error("Missing user id for update.");
                }

                // Update payload: send only what backend expects
                const updatePayload: any = {
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    restaurant_id: user.restaurant_id,
                    is_active: user.is_active,
                };

                // only send password if you add a password input and it’s not empty
                if (user.password && user.password.trim().length > 0) {
                    updatePayload.password = user.password;
                }

                const form_data: UpdateUserProp = {
                    userId: selectedUserId, user: updatePayload
                }

                const res = await UpdateUserApi(form_data);
                if (res) {
                    setSuccess(true);
                    onSuccess?.();
                }
            }
        } catch (err: any) {
            setError(err?.detail || err?.message || "Action failed.");
        } finally {
            setLoading(false);
        }
    };




    return (
        <>
            {
                !success ? (
                    <ModalContainer>
                        <UserModalContainer>
                            <div className="container">
                                <div className="heading" data-testid='heading'>
                                    <SubHeader
                                        text={title}
                                        className='text-left'
                                    />
                                    <img
                                        src={closeBtn}
                                        alt="close"
                                        onClick={onClose}
                                        className='cursor-pointer'
                                    />
                                </div>
                                <div className="content">
                                    <Paragraph
                                        text={description}
                                        className='text-left'
                                    />
                                </div>
                            </div>
                            <div className="form_container">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <Paragraph
                                            text="Full Name"
                                            className='text-left font-bold'
                                        />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="Full Name"
                                            className='text-left'
                                            required={true}
                                            value={user.full_name}
                                            onChange={(e) => handleChange("full_name", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Paragraph
                                            text="Email"
                                            className='text-left font-bold'
                                        />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email"
                                            className='text-left'
                                            value={user.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                        />
                                    </div>
                                    {
                                        !newUser && (
                                            <div className="form-group">
                                                <Paragraph
                                                    text="Password"
                                                    className='text-left font-bold'
                                                />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Set Password"
                                                    className='text-left'
                                                    value={user.password}
                                                    onChange={(e) => handleChange("password", e.target.value)}
                                                />
                                            </div>
                                        )
                                    }
                                    <div className="form-group">
                                        <Paragraph
                                            text="Restaurant Name"
                                            className='text-left font-bold'
                                        />
                                        <CustomSelect
                                            value={user.restaurant_id}
                                            onChange={(e) => handleChange("restaurant_id", e.target.value)}
                                        >
                                            <option value="">Select Restaurant</option>
                                            <ObjectSelectOptions data={restaurants} />
                                        </CustomSelect>
                                    </div>
                                    <div className="form-group">
                                        <Paragraph
                                            text="Role"
                                            className='text-left font-bold'
                                        />
                                        <CustomSelect
                                            value={user.role}
                                            onChange={(e) => handleChange("role", e.target.value)}
                                        >
                                            <option value="">Select Role</option>
                                            <ObjectSelectOptions data={roleHeading} />
                                        </CustomSelect>
                                    </div>
                                    {error && <p style={{ color: "red", marginBottom: "10px" }} className='text-sm'>{error}</p>}
                                    <div className="form_buttons">
                                        <AppButton
                                            text="Cancel"
                                            onClick={onClose}
                                            variant='outline'
                                            fullWidth={true}
                                            type="button"
                                        />
                                        <AppButton
                                            text={newUser ? 'Create Account' : 'Save changes'}
                                            variant="primary"
                                            fullWidth={true}
                                            type={'submit'}
                                            disabled={loading}
                                        />
                                    </div>
                                </form>
                            </div>
                        </UserModalContainer>
                    </ModalContainer>
                ) : (
                    <MessageSuccess
                        title={newUser ? 'Account created successfully' : 'Account updated successfully'}
                        description={
                            newUser
                                ? `This is to confirm that ${user.full_name}'s account has been created successfully`
                                : `This is to confirm that ${user.full_name}'s account has been updated successfully`
                        }
                    />
                )
            }
        </>
    )
}

