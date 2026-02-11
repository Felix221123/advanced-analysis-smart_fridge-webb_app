import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { CountContainer } from '@/components/CountContainer'
import {
    TabContainer,
    StockBox,
} from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { isCompliant, isExpiringSoon } from '@/utils/stockFilters';
import { AllProducts } from '@/packages/api/ServicesApi';
import { AllFoodItemProps } from '@/interface/ComponentProps';
import { useAuth } from '@/context/useAuth';
import { isExpired } from '@/utils/stockFilters'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";




const EXPIRING_SOON_DAYS = 7;



const normaliseProducts = (res: any): AllFoodItemProps[] => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.items)) return res.items
    if (Array.isArray(res?.results)) return res.results
    return []
}

const getRowStatus = (p: AllFoodItemProps) => {
    // order matters
    if (isExpired(p)) {
        return {
            label: 'Expired',
            bg: [220, 53, 69] as [number, number, number],
            text: [255, 255, 255] as [number, number, number],
        }
    }

    // yellow = running out (low stock OR expiring soon)
    const lowStock = p.qty_total <= p.reorder_point
    const expSoon = isExpiringSoon(p, EXPIRING_SOON_DAYS)

    if (lowStock || expSoon) {
        return {
            label: lowStock && expSoon ? 'Low stock + Expiring soon' : lowStock ? 'Low stock' : 'Expiring soon',
            bg: [255, 193, 7] as [number, number, number],
            text: [0, 0, 0] as [number, number, number],
        }
    }

    return {
        label: 'Good',
        bg: [25, 135, 84] as [number, number, number],
        text: [255, 255, 255] as [number, number, number],
    }
}

const formatDate = (value: string | null) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString()
}


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

    const handleDownloadInventoryReport = () => {
        // ✅ stop empty report
        if (loading) {
            setError('Products are still loading — try again in a moment.')
            return
        }
        if (!products.length) {
            setError('No products found to include in the report.')
            return
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
        const today = new Date()

        const statusMeta = products.map(getRowStatus)
        const safeCount = statusMeta.filter((s) => s.label === 'Good').length
        const expiredCount = statusMeta.filter((s) => s.label === 'Expired').length
        const yellowCount = statusMeta.filter((s) => s.label !== 'Good' && s.label !== 'Expired').length

        // Title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(22)
        doc.text('Inventory Report', 40, 55)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.text(`Restaurant ID: ${restaurantId || '—'}`, 40, 85)
        doc.text(`Generated: ${today.toLocaleString()}`, 40, 108)

        // Summary line
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(`Safe: ${safeCount}`, 40, 145)
        doc.text(`Use Soon / Running Out: ${yellowCount}`, 220, 145)
        doc.text(`Expired: ${expiredCount}`, 480, 145)

        const tableBody = products.map((p, idx) => [
            p.name,
            String(p.qty_total),
            p.unit,
            formatDate(p.expiry_date),
            p.supplier_name || '—',
            statusMeta[idx].label,
        ])

        autoTable(doc, {
            startY: 175,
            head: [['Item', 'Qty', 'Unit', 'Expiry date', 'Supplier', 'Status']],
            body: tableBody,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, valign: 'middle' },
            headStyles: { fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.section !== 'body') return
                const idx = data.row.index
                const bg = statusMeta[idx].bg
                const text = statusMeta[idx].text

                data.cell.styles.fillColor = bg
                data.cell.styles.textColor = text
            },
            margin: { left: 40, right: 40 },
        })

        // Footer
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(9)
            doc.setTextColor(120)
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() - 95,
                doc.internal.pageSize.getHeight() - 25
            )
        }

        const fileName = `inventory-report-${today.toISOString().slice(0, 10)}.pdf`
        doc.save(fileName)

        // Optional preview tab (user can print from PDF viewer)
        const blobUrl = doc.output('bloburl')
        window.open(blobUrl, '_blank')
    }

    const downloadDisabled = loading || !products.length



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
                            text={loading ? 'Loading…' : 'Download Inventory Report'}
                            fullWidth={true}
                            variant="outline"
                            onClick={handleDownloadInventoryReport}
                            disabled={downloadDisabled}
                        />
                    </div>

                </StockBox>
            </TabContainer>
        </>
    )
}

