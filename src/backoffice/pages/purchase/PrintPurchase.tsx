import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as apiClient from "../../../api/purchase";
import { PurchaseData, PurchaseDetail } from "./Purchase";
import "./PrintPurchase.css"; // Make sure this is imported for component styling

// Component for render header invoice
const InvoiceHeader: React.FC<{ data: PurchaseData }> = ({ data }) => {
    return (
        <>
            {/* Invoice Header */}
            <div className="flex flex-wrap justify-between gap-4 px-4">
                <div className="text-2xl font-semibold uppercase">Purchase Invoice</div>
                <div className="shrink-0">
                    {/* Your Logo */}
                    <img src="/assets/images/logo.svg" alt="image" className="w-14 ltr:ml-auto rtl:mr-auto" />
                </div>
            </div>
            {/* Company Details */}
            <div className="px-4 ltr:text-right rtl:text-left">
                <div className="mt-6 space-y-1 text-white-dark">
                    {/* Company address, email, phone */}
                    <div>Your Company Address</div>
                    <div>your_company@email.com</div>
                    <div>+1 (000) 000-0000</div>
                </div>
            </div>

            <hr className="my-6 border-[#e0e6ed] dark:border-[#1b2e4b]" />
        </>
    )
}

// Component for render information
const InvoiceInfo: React.FC<{ data: PurchaseData }> = ({ data }) => {
    return (
        <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
            <div className="flex-1">
                <div className="space-y-1 text-white-dark">
                    <div>Supplier:</div>
                    <div className="font-semibold text-black dark:text-white">{data.suppliers?.name}</div>
                </div>
            </div>
            <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                    <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">Reference :</div>
                        <div>{data.ref}</div>
                    </div>
                    <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">Date :</div>
                        <div>{data.date}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Component for render items
const InvoiceItems: React.FC<{ items: PurchaseDetail[] }> = ({ items }) => {
    return (
        <div className="table-responsive mt-6">
            <table className="table-striped">
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>ITEMS</th>
                        <th>QTY</th>
                        <th className="ltr:text-right rtl:text-left">PRICE</th>
                        <th className="ltr:text-right rtl:text-left">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td className="ltr:text-right rtl:text-left">${item.cost}</td>
                            <td className="ltr:text-right rtl:text-left">${item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Component for render total
const InvoiceTotal: React.FC<{ grandTotal: number, paidAmount: number }> = ({ grandTotal, paidAmount }) => {
    const due = grandTotal - paidAmount;
    return (
        <div className="mt-6 grid grid-cols-1 px-4 sm:grid-cols-2">
            <div></div>
            <div className="space-y-2 ltr:text-right rtl:text-left">
                <div className="flex items-center">
                    <div className="flex-1">Grand Total</div>
                    <div className="w-[37%]">$ {Number(grandTotal).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                </div>
                <div className="flex items-center">
                    <div className="flex-1">Paid Amount</div>
                    <div className="w-[37%]">$ {Number(paidAmount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                </div>
                <div className="flex items-center text-lg font-semibold">
                    <div className="flex-1">Due</div>
                    <div className="w-[37%]">$ {Number(due).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                </div>
            </div>
        </div>
    )
}

const PrintPurchase: React.FC = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch purchase data on component mount
    useEffect(() => {
        const fetchPurchase = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const purchase = await apiClient.getPurchaseByid(Number(id));
                setPurchaseData(purchase);
            } catch (err: any) {
                setError(err.message || "Error fetching purchase");
                toast.error(err.message || "Error fetching purchase", {
                    position: 'top-right',
                    autoClose: 2000
                });
                navigate("/admin/purchase");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchPurchase();
        }
    }, [id, navigate]);

    const handlePrint = async () => {
        if (printRef.current && purchaseData) {
            const printWindow = window.open('', '_blank'); // Open in a new tab/window
            if (printWindow) {
                // Fetch the CSS content
                const cssUrl = `${window.location.origin}/print-purchase.css`; // Construct the full URL
                try {
                    const response = await fetch(cssUrl);
                    const cssText = await response.text();

                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Print Invoice</title>
                                <style>${cssText}</style>
                            </head>
                            <body>
                                <div class="print-container">
                                    ${printRef.current.innerHTML}
                                </div>
                                <script>
                                    window.onafterprint = () => {
                                        window.close();
                                    };
                                    window.onload = () => {
                                        window.print();
                                    };
                                </script>
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                } catch (error) {
                    console.error("Error loading CSS:", error);
                    toast.error("Error loading print styles", {
                        position: 'top-right',
                        autoClose: 2000
                    });
                }
            }
        }
    };

    // Handle loading and errors
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!purchaseData) {
        return <div>No purchase data found.</div>;
    }

    return (
        <>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-end">
                <button type="button" className="btn btn-primary gap-2" onClick={handlePrint}>
                    {/* Print SVG */}
                    Print
                </button>
            </div>
            <div ref={printRef} className="panel">
                <InvoiceHeader data={purchaseData} />
                <InvoiceInfo data={purchaseData} />
                {/* Invoice Items Table */}
                <InvoiceItems items={purchaseData.purchaseDetails} />
                {/* Totals */}
                <InvoiceTotal grandTotal={purchaseData.grandTotal} paidAmount={purchaseData.paidAmount || 0} />
            </div>
        </>
    );
};

export default PrintPurchase;
