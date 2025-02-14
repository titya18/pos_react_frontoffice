import React, { useEffect, useState } from "react";
import * as apiClient from "../../../api/product";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpZA, faArrowDownAZ, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "../../../hooks/useAppContext";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import ShowDeleteConfirmation from "../../components/ShowDeleteConfirmation";
import Modal from "./Modal";
import { NavLink } from "react-router-dom";

export interface ProductData {
    id?: number;
    categoryId: number,
    brandId: number,
    categories: { id: number, name: string } | null;
    brands: { id: number, name: string } | null;
    name: string;
    note: string;
    isActive: string;
    image: File[] | null;
    imagesToDelete: string[];
};

const Product: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [selectProduct, setSelectProduct] = useState<{ id: number | undefined, categoryId: number | null, brandId: number | null, name: string, note: string, isActive: string, image: File[] | null } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { hasPermission } = useAppContext();

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const { data, total } = await apiClient.getAllProducts(currentPage, searchTerm, itemsPerPage, sortField, sortOrder);
            setProducts(data);
            setTotalItems(total);
            setTotalPages(Math.ceil(total / itemsPerPage));
        } catch (error) {
            console.error("Error fetching prduct:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [currentPage, searchTerm, itemsPerPage, sortField, sortOrder]);

    const handleSortChange = (field: string) => {
        if (sortField === field && sortOrder === "desc") {
            setSortOrder("asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const queryClient = useQueryClient();

    const handleAddorEditProduct = async (id: number | null, categoryId: number | null, brandId: number | null, name: string, note: string, isActive: string, image: File[] | null, imagesToDelete: string[]) => {
        try {
            await queryClient.invalidateQueries("validateToken");
            const productData: ProductData = {
                id: id ? id : undefined,
                categoryId: categoryId ?? 0, // Fallback to 0 if null
                brandId: brandId ?? 0, // Fallback to 0 if null
                categories: { id: categoryId ?? 0, name: "Default Category" }, // Provide default values
                brands: { id: brandId ?? 0, name: "Default Brand" }, // Provide default values
                name,
                note,
                isActive,
                image,
                imagesToDelete
            };

            await apiClient.upsertProduct(productData);
            toast.success(id ? "Product updated successfully" : "Product created successfully", {
                position: "top-right",
                autoClose: 2000
            });
            fetchProduct();
            setIsModalOpen(false);
        } catch (error: any) {
            // Check if error.message is set by your API function
            if (error.message) {
                toast.error(error.message, {
                    position: "top-right",
                    autoClose: 2000
                });
            } else {
                toast.error("Error adding/editting iterm", {
                    position: "top-right",
                    autoClose: 2000
                });
            }
        }
    };

    const handleEditClick = (productData: ProductData) => {
        setSelectProduct({
            id: productData.id,
            categoryId: productData.categoryId,
            brandId: productData.brandId,
            name: productData.name,
            note: productData.note,
            isActive: productData.isActive,
            image: productData.image,
        });
        setIsModalOpen(true);
    };
    
    const handleDeleteProduct = async (id: number) => {
        const confirmed = await ShowDeleteConfirmation();
        if (!confirmed) {
            return;
        }

        try {
            await queryClient.invalidateQueries("validateToken");
            await apiClient.deleteProduct(id);
            toast.success("Product deleted successfully", {
                position: "top-right",
                autoClose: 2000
            });

            fetchProduct();
        } catch (error: any) {
            console.error("Error deleting product:", error);
            toast.error(error.message || "Error deleting product", {
                position: "top-right",
                autoClose: 2000
            });
        }
    };

    const handleStatusChange = async (id: number) => {
        try {
            await queryClient.invalidateQueries("validateToken");
            await apiClient.statusProduct(id);
            toast.success("Status changed successfully", {
                position: "top-right",
                autoClose: 2000
            });
            fetchProduct();
        } catch (error: any) {
            console.error("Error update status:", error);
            toast.error(error.message || "Error update status", {
                position: "top-right",
                autoClose: 2000
            });
        }
    }

    const API_BASE_URL = process.env.API_URL || "";

    return (
        <>
            <div className="pt-0">
                <div className="space-y-6">
                    <div className="panel">
                        <div className="relative">
                            <div className="px-0">
                                <div className="md:absolute md:top-0 ltr:md:left-0 rtl:md:right-0">
                                    <div className="mb-5 flex items-center gap-2">
                                        {hasPermission('User-Create') &&
                                            <button className="btn btn-primary gap-2" onClick={() => { setIsModalOpen(true); setSelectProduct(null) }}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24px"
                                                    height="24px"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-5 w-5"
                                                >
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                                Add New
                                            </button>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="dataTable-wrapper dataTable-loading no-footer sortable searchable">
                                <div className="dataTable-top">
                                    <div className="dataTable-search">
                                        <input
                                            className="dataTable-input"
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="dataTable-container">
                                    {isLoading ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <table id="myTable1" className="whitespace-nowrap dataTable-table">
                                            <thead>
                                                <tr>
                                                    <th onClick={() => handleSortChange("image")}>
                                                        Image <span className="cursor-pointer">{sortOrder === "desc" ? <FontAwesomeIcon icon={faArrowDownAZ} /> :<FontAwesomeIcon icon={faArrowUpZA} />}</span>
                                                    </th>
                                                    <th onClick={() => handleSortChange("name")}>
                                                        Product <span className="cursor-pointer">{sortOrder === "desc" ? <FontAwesomeIcon icon={faArrowDownAZ} /> :<FontAwesomeIcon icon={faArrowUpZA} />}</span>
                                                    </th>
                                                    <th onClick={() => handleSortChange("categoryId")}>
                                                        Category <span className="cursor-pointer">{sortOrder === "desc" ? <FontAwesomeIcon icon={faArrowDownAZ} /> :<FontAwesomeIcon icon={faArrowUpZA} />}</span>
                                                    </th>
                                                    <th onClick={() => handleSortChange("brandId")}>
                                                        Brand <span className="cursor-pointer">{sortOrder === "desc" ? <FontAwesomeIcon icon={faArrowDownAZ} /> :<FontAwesomeIcon icon={faArrowUpZA} />}</span>
                                                    </th>
                                                    <th>Status</th>
                                                    <th className="!text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {products && products.length > 0 ? (
                                                    products.map((rows, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td><img src={`${API_BASE_URL}/${Array.isArray(rows.image) ? rows.image[0] : rows.image}`} alt={rows.name} width="50"/></td>
                                                                <td>{rows.name}</td>
                                                                <td>{rows.categories ? rows.categories.name : ""}</td>
                                                                <td>{rows.brands ? rows.brands.name : ""}</td>
                                                                <td>
                                                                    <button onClick={() => rows.id && handleStatusChange(rows.id)}>
                                                                        {rows.isActive == '1'
                                                                            ? <span className="badge badge-outline-success"><FontAwesomeIcon icon={faCheck} /> Actived</span>
                                                                            : <span className="badge badge-outline-danger"><FontAwesomeIcon icon={faXmark} /> DisActived</span> 
                                                                        }
                                                                    </button>
                                                                </td>
                                                                <td className="text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {hasPermission('Variant-View') &&
                                                                            <NavLink to={`/admin/productvariant/${rows.id}`}>
                                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary">
                                                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"></circle>
                                                                                    <path opacity="0.5" d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z" stroke="currentColor" strokeWidth="1.5"></path>
                                                                                </svg>
                                                                            </NavLink>
                                                                        }
                                                                        {hasPermission('Product-Update') &&
                                                                            <button type="button" className="hover:text-warning" onClick={() => handleEditClick(rows)} title="Edit">
                                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-success">
                                                                                    <path d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z" stroke="currentColor" strokeWidth="1.5"></path>
                                                                                    <path opacity="0.5" d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015" stroke="currentColor" strokeWidth="1.5"></path>
                                                                                </svg>
                                                                            </button>
                                                                        }
                                                                        {hasPermission('Product-Delete') &&
                                                                            <button type="button" className="hover:text-danger" onClick={() => rows.id && handleDeleteProduct(rows.id)} title="Delete">
                                                                                <svg
                                                                                    width="24"
                                                                                    height="24"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="w-5 h-5 text-danger"
                                                                                >
                                                                                    <path
                                                                                        d="M20.5001 6H3.5"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        strokeLinecap="round"
                                                                                    ></path>
                                                                                    <path
                                                                                        d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        strokeLinecap="round"
                                                                                    ></path>
                                                                                    <path
                                                                                        opacity="0.5"
                                                                                        d="M9.5 11L10 16"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        strokeLinecap="round"
                                                                                    ></path>
                                                                                    <path
                                                                                        opacity="0.5"
                                                                                        d="M14.5 11L14 16"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        strokeLinecap="round"
                                                                                    ></path>
                                                                                    <path
                                                                                        opacity="0.5"
                                                                                        d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                    ></path>
                                                                                </svg>
                                                                            </button>
                                                                        }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3}>No Product Found!</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    itemsPerPage={itemsPerPage}
                                    handleItemsPerPageChange={handleItemsPerPageChange}
                                    totalItems={totalItems}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddorEditProduct}
                product={selectProduct}
            />
        </>
    );
};

export default Product;