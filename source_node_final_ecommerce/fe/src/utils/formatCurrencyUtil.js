export const formatCurrency = (value=0, currency="VND") => {
    return new Intl.NumberFormat({
        style: "currency",
        currency
    }).format(value) + ((currency === "VND") ? " VNĐ" : " $");
}