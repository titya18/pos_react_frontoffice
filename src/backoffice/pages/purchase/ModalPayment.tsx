import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faClose, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useAppContext } from "../../../hooks/useAppContext";
import { getAllPaymentMethods } from "../../../api/paymentMethod";
import { getPurchasePaymentById } from "../../../api/purchase";

interface PaymentMethodData {
    id: number;
    name: string;
}

export interface PaymentData {
    id?: number;
    branchId: number | null;
    purchaseId: number | null;
    paymentMethodId: number | null;
    amount: number | null;
    createdAt: string | null;
    paymentMethods: { name: string } | null;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (brandId: number | null, purchaseId: number | null, paymentMethodId: number | null, paidAmount: number | null, amount: number, createdAt: string | null) => void;
    amountPurchase?: {branchId: number | null, purchaseId: number | null, paidAmount: number | null, amount: number | null, createdAt: string | null} | null;
};

export interface FormData {
    paymentMethodId: number;
    amount: number;
    due_balance: number;
};

const ModalPayment: React.FC<ModalProps> = ({ isOpen, onClose, amountPurchase, onSubmit }) => {
    const [paymentMethods, setPaymentMethod] = useState<PaymentMethodData[]>([]);
    const [purchasePayments, setPurchasePayments] = useState<PaymentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>();

    const { hasPermission } = useAppContext();
    
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            setIsLoading(true);
            try {
                const { data } = await getAllPaymentMethods(1, "", 100, null, null);
                setPaymentMethod(data as PaymentMethodData[]);
            } catch (error) {
                console.error("Error fetching payment method:", error);
            } finally {
                setIsLoading(false);
            }
        }

        const fetchPurchasePayments = async () => {
            setIsLoading(true);
            try {
                const payments = await getPurchasePaymentById(amountPurchase?.purchaseId ?? 0);
                setPurchasePayments(payments);
                console.log("payment:", payments);
            } catch (error) {
                console.error("Error fetching purchase payment:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPaymentMethods();
        fetchPurchasePayments();

        if (amountPurchase) {
            setValue('due_balance', Number(amountPurchase.amount ?? 0) - Number(amountPurchase.paidAmount ?? 0));
            reset({
                due_balance: Number(amountPurchase.amount ?? 0) - Number(amountPurchase.paidAmount ?? 0),
            });
        } else {
            reset({
                amount: undefined,
            });
        }
    }, [amountPurchase, setValue, reset]);

    const handlePaidAmount = (e: any) => {
        setValue("due_balance", (Number(amountPurchase?.amount) - Number(amountPurchase?.paidAmount)) - Number(e.target.value));
    }

    const handleFormSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            // Call the onSubmit function, making sure it recieve the correct format
            await onSubmit(amountPurchase?.branchId || null, amountPurchase?.purchaseId || null, amountPurchase?.paidAmount || null, data.paymentMethodId, data.amount, amountPurchase?.createdAt || null);
            reset();
            onClose();
        } catch (error) {
            console.log("Error submitting from:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
            <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-3xl my-8">
                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                            <h5 className="flex font-bold text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="25" className="mt-0.5" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" d="M15 5H9c-2.809 0-4.213 0-5.222.674a4 4 0 0 0-1.104 1.104C2 7.787 2 9.19 2 12s0 4.213.674 5.222a4 4 0 0 0 1.104 1.104c.347.232.74.384 1.222.484M9 19h6c2.809 0 4.213 0 5.222-.674a4 4 0 0 0 1.104-1.104C22 16.213 22 14.81 22 12s0-4.213-.674-5.222a4 4 0 0 0-1.104-1.104c-.347-.232-.74-.384-1.222-.484"></path>
                                        <path d="M9 9a3 3 0 1 0 0 6m6-6a3 3 0 1 1 0 6"></path><path strokeLinecap="round" d="M9 5v14m6-14v14"></path>
                                    </g>
                                </svg>
                                Payment Purchasing
                            </h5>
                            <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <div className="p-5">
                                {/* Parent Container */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    
                                    {/* Left Docked Block (Smaller) */}
                                    <div className="w-full sm:w-3/4">
                                        <h1 className="font-bold text-lg"><FontAwesomeIcon icon={faClockRotateLeft} /> History Paid</h1>
                                        {purchasePayments.length > 0 ? (
                                            purchasePayments.map((rows, index) => {
                                                const isSingleRecord = purchasePayments.length === 1;
                                                // const isFirstRecord = index === 0 && !isSingleRecord;
                                                const isLastRecord = index === purchasePayments.length - 1 && !isSingleRecord;
                                                
                                                return (
                                                    <div className="flex" key={index}>
                                                        <p className="text-[#3b3f5c] dark:text-white-light min-w-[58px] max-w-[200px] text-base font-semibold py-2.5" style={{ width: '110px' }}>
                                                            $ { Number(rows.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
                                                        </p>
                                                        
                                                        {/* Conditional Div Styling */}
                                                        <div className={`relative before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px] 
                                                            before:w-2.5 before:h-2.5 before:border-2 ${isSingleRecord || isLastRecord ? 'before:border-info' : 'before:border-info'}
                                                            before:rounded-full 
                                                            ${!isSingleRecord && !isLastRecord ? 'after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px] after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2 after:border-secondary after:rounded-full' : ''}
                                                        `}>
                                                        </div>

                                                        <div className="p-2.5 self-center ltr:ml-2.5 rtl:mr-2.5">
                                                            <p className="text-[#3b3f5c] dark:text-white-light font-semibold font-semibold text-[13px]">
                                                                { rows.paymentMethods?.name }
                                                            </p>
                                                            <p className="text-white-dark text-xs font-bold self-center min-w-[100px] max-w-[100px]">
                                                                {rows.createdAt ? format(new Date(rows.createdAt), "yyyy-MM-dd") : "N/A"}
                                                                {/* {rows.createdAt ? format(new Date(rows.createdAt), "yyyy-MM-dd HH:mm:ss") : "N/A"} */}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p>No Data</p>
                                        )}

                                    </div>

                                    {/* Right Docked Block (Bigger) */}
                                    <div className="w-full sm:w-2/4">
                                        <div className="dark:text-white-dark/70 text-base font-medium text-[#1f2937] mb-3">
                                            <label>
                                                Payment Method <span className="text-danger text-md">*</span>
                                            </label>
                                            <select
                                                id="paymentMethodId"
                                                className="form-input w-full"
                                                disabled={Number(amountPurchase?.amount ?? 0) === Number(amountPurchase?.paidAmount ?? 0)}
                                                {...register("paymentMethodId", { required: "Payment Method is required" })}
                                            >
                                                <option value="">Select a payment method...</option>
                                                {paymentMethods.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.paymentMethodId && <span className="error_validate">{errors.paymentMethodId.message}</span>}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="dark:text-white-dark/70 text-base font-medium text-[#1f2937]">
                                                <label htmlFor="module">
                                                    Paid <span className="text-danger text-md">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Supplier's name"
                                                    className="form-input w-full"
                                                    disabled={Number(amountPurchase?.amount ?? 0) === Number(amountPurchase?.paidAmount ?? 0)}
                                                    {...register("amount", { required: "Amount is required" })}
                                                    onChange={(e) => handlePaidAmount(e)}
                                                />
                                                {errors.amount && <p className="error_validate">{errors.amount.message}</p>}
                                            </div>

                                            <div className="dark:text-white-dark/70 text-base font-medium text-[#1f2937]">
                                                <label htmlFor="module">Due Balance</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Supplier's name"
                                                    className="form-input w-full"
                                                    readOnly
                                                    {...register("due_balance")}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                                                <FontAwesomeIcon icon={faClose} className="mr-1" />
                                                Discard
                                            </button>
                                            {hasPermission("Purchase-Payment") && (
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                    disabled={isLoading || Number(amountPurchase?.amount ?? 0) === Number(amountPurchase?.paidAmount ?? 0)}
                                                >
                                                    <FontAwesomeIcon icon={faSave} className="mr-1" />
                                                    {isLoading ? "Saving..." : "Save"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
}

export default ModalPayment;