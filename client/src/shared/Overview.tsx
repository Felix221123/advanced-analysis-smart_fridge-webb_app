import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { CountContainer } from '@/components/CountContainer'
import {
    TabContainer,
    StockBox,
} from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { isCompliant,isExpiringSoon  } from '@/utils/stockFilters';
import { AllProducts } from '@/packages/api/ServicesApi';
import { AllFoodItemProps } from '@/interface/ComponentProps';
import { useAuth } from '@/context/useAuth';
import { isExpired } from '@/utils/stockFilters'



const EXPIRING_SOON_DAYS = 7;


export const Overview: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<AllFoodItemProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";

    const fetchProducts = useCallback(async () => {
        if (!restaurantId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await AllProducts();
            const filtered = Array.isArray(res)
                ? res.filter((p: AllFoodItemProps) => String(p.restaurant_id) === restaurantId)
                : [];
            setProducts(filtered);
        } catch (err: any) {
            setError(err?.message || err?.detail || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const compliantItems = useMemo(
        () => products.filter((p) => isCompliant(p, EXPIRING_SOON_DAYS)),
        [products]
    );

    console.log(loading, ' is the loading state')
    console.log(error, ' is the loading state')

    const expiredItems = useMemo(
        () => products.filter(isExpired),
        [products]
    );

    const expiringSoonItems = useMemo(
        () => products.filter((p) => isExpiringSoon(p, EXPIRING_SOON_DAYS)),
        [products]
    );

    return (
        <>
            <TabContainer>
                <StockBox>
                    <div className="heading">
                        <div className="tabHeader">
                            <div className="headerIcon">
                                <SubHeader
                                    text='Food Safety Overview'
                                    className='font-bold'
                                />
                            </div>
                            <Paragraph
                                text='Current Status of all items in the fridge'
                            />
                        </div>
                    </div>

                    {/* item header in containers */}
                    <div className="itemsContainer">
                        <CountContainer
                            heading='Safe to Use'
                            figures={String(compliantItems.length)}
                            container='green'
                            description='Items in good condition'
                        />
                        <CountContainer
                            heading='Use Soon'
                            figures={String(expiringSoonItems.length)}
                            container='yellow'
                            description='Expiring within 7 days'
                        />
                        <CountContainer
                            heading='Remove'
                            figures={String(expiredItems.length)}
                            container='red'
                            description='Past expiry date'
                        />
                    </div>
                    <div className="buttonContainer">
                        <AppButton
                            text='Download Inventory Report'
                            fullWidth={true}
                            variant='outline'
                        />
                    </div>

                </StockBox>
            </TabContainer>
        </>
    )
}

