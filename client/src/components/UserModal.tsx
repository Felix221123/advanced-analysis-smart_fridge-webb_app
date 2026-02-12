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

    const [fieldErrors, setFieldErrors] = useState<{ full_name?: string }>({});

    const FULL_NAME_ALLOWED = /^[\p{L}\s'-]*$/u;


    const FULL_NAME_VALID = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;

    const normalise = (s: string) => s.replace(/\s+/g, " ").trim();

    const stripDiacritics = (s: string) =>
        s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

    const validateFullName = (raw: string): string | null => {
        const name = normalise(raw);

        if (!name) return "Full name is required.";
        if (!FULL_NAME_ALLOWED.test(name)) return "Enter an appropriate name (letters only).";

        const parts = name.split(" ").filter(Boolean);

        if (parts.length < 2) return "Please enter a first and last name.";
        if (parts.length > 4) return "Please enter a valid full name (2–4 words).";
        if (name.length > 60) return "Name is too long.";

        // 4 repeated letters in a row (e.g., aaaa, zzzz)
        if (/(.)\1\1\1/u.test(stripDiacritics(name))) {
            return "Please enter a valid name.";
        }

        for (const p of parts) {
            const part = p.replace(/['-]/g, ""); // ignore separators inside a part
            if (part.length < 2) return "Each name must be at least 2 letters.";
            if (part.length > 30) return "A name part is too long.";

            // vowel check (skip for very short words like Ng, Li)
            const clean = stripDiacritics(part).toLowerCase();
            if (clean.length > 2 && !/[aeiouy]/.test(clean)) {
                return "Please enter a valid name.";
            }
        }

        return null;
    };


    // Handle form field change
    const handleChange = (field: keyof CreateUserProps, value: string | boolean) => {
        if (field === "full_name" && typeof value === "string") {
            // block disallowed characters immediately
            if (!FULL_NAME_ALLOWED.test(value)) {
                setFieldErrors((prev) => ({ ...prev, full_name: "Enter an appropriate name (letters only)." }));
                return;
            }

            // run plausibility validation (shows message but still lets them type)
            const msg = validateFullName(value);
            setFieldErrors((prev) => ({ ...prev, full_name: msg ?? undefined }));
        }

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

        const nameTrimmed = user.full_name.trim();
        if (!FULL_NAME_VALID.test(nameTrimmed)) {
            setFieldErrors((prev) => ({
                ...prev,
                full_name: "Enter an appropriate name (letters only).",
            }));
            return;
        }

        const msg = validateFullName(user.full_name);
        if (msg) {
            setFieldErrors((prev) => ({ ...prev, full_name: msg }));
            return;
        }

        try {
            if (newUser) {
                const my_form = {
                    full_name: nameTrimmed,
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
                    full_name: nameTrimmed,
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
                                        {fieldErrors.full_name && (
                                            <p style={{ color: "red", marginTop: "6px" }} className="text-sm">
                                                {fieldErrors.full_name}
                                            </p>
                                        )}
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

