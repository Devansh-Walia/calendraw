export const getLocalStorage = async (key: string) => {
    const value = localStorage.getItem(key);

    if (!value) return {};

    return JSON.parse(value);
};

export const setLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};
