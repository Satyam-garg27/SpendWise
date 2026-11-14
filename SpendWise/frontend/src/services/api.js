
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("spendwise_token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
};

export const getTransactions = (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/transactions?${query}`);
};

export const addTransaction = (data) =>
    request("/transactions", {
        method: "POST",
        body: JSON.stringify(data)
    });

export const updateTransaction = (id, data) =>
    request(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });

export const deleteTransaction = (id) =>
    request(`/transactions/${id}`, {
        method: "DELETE"
    });
