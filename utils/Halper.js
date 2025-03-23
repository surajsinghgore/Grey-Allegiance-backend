
export const getPublicIdFromUrl = (url) => {
    const urlParts = url.split("/");
    return urlParts
        .slice(7)
        .join("/")
        .replace(/\.\w+$/, "");
};