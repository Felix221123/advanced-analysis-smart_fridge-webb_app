import React from 'react'
import {
    ProductCardContainer,
    CardHeader,
    RolePill,
    InfoRow,
    InfoLabel,
    ButtonGroup,
} from '@/styles/components/ProductCard.style'
import { EditIcon } from './ProductCard'
import { AppButton } from './BaseButton'
import { Paragraph } from './Paragraph'
import Remove from '@/assets/delete.svg'
import { roleHeading } from '@/constants/roleHeading'
import { UserCardProps } from '@/interface/UserProps'



export const UserCard: React.FC<UserCardProps> = ({
    full_name,
    email,
    role,
    onEdit,
    onRemove
}) => {

    return (
        <>
            <ProductCardContainer>
                <CardHeader>
                    <div className="itemNameContainer">
                        <Paragraph
                            text={full_name}
                            className='item_name font-bold'
                        />

                        <div className="status-area">
                            {role && (
                                <RolePill $role={role}>
                                    {roleHeading[role]}
                                </RolePill>
                            )}
                        </div>
                    </div>

                    <ButtonGroup>
                        <AppButton
                            variant='outline'
                            text='Edit'
                            onClick={onEdit}
                            icon={<EditIcon />}
                        />
                        <AppButton
                            variant='outline'
                            text='Remove'
                            onClick={onRemove}
                            icon={<RemoveIcon />}
                        />
                    </ButtonGroup>
                </CardHeader>

                {/* email */}
                <InfoRow>
                    <InfoLabel>{email}</InfoLabel>
                </InfoRow>

                {/* permissions */}
                {
                    role === 'DELIVERY_PERSON' ? (
                        <>
                            <InfoRow>
                                <InfoLabel>Can Insert: </InfoLabel>
                                <span> Yes </span>

                                <InfoLabel>Can Remove: </InfoLabel>
                                <span> No </span>
                            </InfoRow>
                        </>
                    ) : (
                        <>
                            <InfoRow>
                                <InfoLabel>Can Insert: </InfoLabel>
                                <span> Yes </span>
                                <InfoLabel>Can Remove: </InfoLabel>
                                <span> Yes </span>
                            </InfoRow>
                        </>
                    )
                }
            </ProductCardContainer>
        </>
    )
}


export const RemoveIcon = () => {
    return (
        <img src={Remove} alt="remove icon" />
    )
}