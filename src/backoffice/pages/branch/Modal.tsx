import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faClose } from '@fortawesome/free-solid-svg-icons';
import { useForm } from "react-hook-form";
import { useAppContext } from "../../../hooks/useAppContext";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: number | null, name: string, address: string) => void;
    branche?: { id: number | undefined, name: string, address: string } | null;
}

export interface FormData {
    name: string,
    address: string
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, branche }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>();

    const { hasPermission } = useAppContext();

    useEffect(() => {
        if (branche) {
            setValue('name', branche.name);
            reset({
                name: branche.name,
                address: branche.address
            });
        } else {
            reset({
                name: '',
                address: ''
            });
        }
    }, [branche, setValue, reset]);

    const handleFormSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            // Call the onSubmit function, making sure it receives the correct format
            await onSubmit(branche?.id || null, data.name, data.address);
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
                <div className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8">
                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                        <h5 className="font-bold text-lg">{branche ? "Edit Branch" : "Add New Branch"}</h5>
                        <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="p-5">
                            <div className="dark:text-white-dark/70 text-base font-medium text-[#1f2937]">
                                <label htmlFor="module">Branch's Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Branch's name" 
                                    className="form-input"
                                    {...register("name", { required: "This field is required" })} 
                                />
                                {errors.name && <p className='error_validate'>{errors.name.message}</p>}
                            </div>

                            <div className="dark:text-white-dark/70 text-base font-medium text-[#1f2937] mt-5">
                                <label htmlFor="module">Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter address" 
                                    className="form-input"
                                    {...register("address")} 
                                />
                            </div>
                            
                            <div className="flex justify-end items-center mt-8">
                                <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                                    <FontAwesomeIcon icon={faClose} className='mr-1' />
                                    Discard
                                </button>
                                {hasPermission('Branch-Create') &&
                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={isLoading}>
                                        <FontAwesomeIcon icon={faSave} className='mr-1' />
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                }
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Modal;