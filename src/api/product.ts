const API_BASE_URL = process.env.API_URL || "";

export interface ProductData {
    id?: number;
    categoryId: number;
    brandId: number;
    categories: { id: number, name: string } | null;
    brands: { id: number, name: string } | null;
    name: string;
    note: string;
    isActive: string;
    image: File[] | null;
    imagesToDelete: string[];
};

export const getAllProducts = async (
    page: number,
    searchTerm: string,
    pageSize: number,
    sortField: string | null,
    sortOrder: "asc" | "desc" | null
): Promise<{ data: ProductData[], total: number }> => {
    const sortParams = sortField && sortOrder ? `&sortField=${sortField}&sortOrder=${sortOrder}` : "";
    const response = await fetch(`${API_BASE_URL}/api/product?page=${page}&searchTerm=${searchTerm}&pageSize=${pageSize}${sortParams}`, {
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("Error fetching product");
    }
    return response.json();
};

export const getProductById = async (id: number): Promise<ProductData> => {
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("Error fetching product");
    }
    return response.json();
};

export const upsertProduct = async (productData: ProductData): Promise<ProductData> => {
    const { id, image, imagesToDelete, ...data } = productData;
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE_URL}/api/product/${id}` : `${API_BASE_URL}/api/product`;

    const formData = new FormData();
    formData.append("categoryId", data.categoryId.toString());
    formData.append("brandId", data.brandId.toString());
    formData.append("name", data.name);
    formData.append("note", data.note);

    // Append images if they exist
    if (image) {
        image.forEach((image) => {
            formData.append("images[]", image); // Append each image in the array
        });
    }

    // Add imagesToDelete as a JSON string
    if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData // Send FormData instead of JSON
    });

    if (!response.ok) {
        const custom_error = id ? "Error updating product" : "Error adding product";
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || custom_error);
    }
    return response.json();
};

export const deleteProduct = async (id: number): Promise<ProductData> => {
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
        credentials: "include",
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Error deleting product");
    }
    return response.json();
};

export const statusProduct = async (id: number): Promise<ProductData> => {
    const response = await fetch(`${API_BASE_URL}/api/product/status/${id}`, {
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("Error updating status");
    }
    return response.json();
}