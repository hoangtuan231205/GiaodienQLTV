function kiemTraDatSach(soLuong, loaiTV) {
    if (soLuong <= 0) {
        return "Lỗi: Số lượng phải lớn hơn 0";
    }
    if (soLuong > 5) {
        return "Lỗi: Vượt quá giới hạn 5 cuốn";
    }

    if (loaiTV === "VIP") {
        return "Hợp lệ";
    } else if (loaiTV === "THUONG") {
        if (soLuong <= 3) {
            return "Hợp lệ";
        } else {
            return "Lỗi: THƯỜNG chỉ mượn tối đa 3 cuốn";
        }
    } else {
        return "Lỗi: Loại TV không hợp lệ";
    }
}