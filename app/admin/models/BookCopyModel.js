class BookCopyModel {
    constructor() {
        this.apiUrl = '/api/v1/book-copies';
    }

    // Hàm bổ trợ để lấy Header có chứa Token
    _getHeaders() {
        const token = localStorage.getItem("token");
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async fetchCopiesByBookId(bookId) {
        try {

            const response = await fetch(`${this.apiUrl}/book/${bookId}`, {
                method: 'GET',
                headers: this._getHeaders() // Thêm token vào đây
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Phiên đăng nhập hết hạn");
                throw new Error("Lỗi tải bản sao");
            } console.log(`test xem đã chạy đến đây chưa`);
            const data = await response.json();
            console.log(`Dữ liệu bản sao tải về:`, data); // Log trước khi return
            return data;
        } catch (error) {
            console.error("Lỗi fetchCopiesByBookId:", error);
            return [];
        }
    }

    async createBulk(bookId, quantity) {
        try {
            const response = await fetch(`${this.apiUrl}/bulk?quantity=${quantity}`, {
                method: 'POST',
                headers: this._getHeaders(), // Thêm token vào đây
                body: JSON.stringify({
                    book: { id: parseInt(bookId) },
                    conditionStatus: "NEW",
                    availabilityStatus: "AVAILABLE"
                })
            });

            if (response.status === 401) {
                alert("Bạn không có quyền thực hiện thao tác này hoặc chưa đăng nhập.");
                return false;
            }

            return response.ok;
        } catch (error) {
            console.error("Lỗi createBulk:", error);
            return false;
        }
    }
    async updateBookCopy(id, updateData) {
        try {
            // Gửi yêu cầu PUT để cập nhật bản sao dựa trên ID
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: this._getHeaders(), // Đảm bảo có Token để tránh lỗi 401
                body: JSON.stringify(updateData)
            });

            if (response.status === 401) {
                alert("Bạn không có quyền thực hiện thao tác này hoặc phiên đăng nhập đã hết hạn.");
                return false;
            }

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Lỗi khi cập nhật bản sao sách");
            }

            return true;
        } catch (error) {
            console.error(`Lỗi updateBookCopy (ID: ${id}):`, error);
            return false;
        }
    }
    async deleteBookCopy(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
                headers: this._getHeaders() // Đảm bảo có Token để không bị 401
            });

            if (response.status === 401) {
                alert("Bạn không có quyền xóa hoặc phiên đăng nhập đã hết hạn.");
                return false;
            }

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Lỗi khi xóa bản sao");
            }

            return true;
        } catch (error) {
            console.error(`Lỗi deleteBookCopy (ID: ${id}):`, error);
            return false;
        }
    }
}