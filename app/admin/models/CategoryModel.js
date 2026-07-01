class CategoryModel {
    constructor() {
        this.apiUrl = '/api/v1/categories';
    }

    // Hàm phụ để lấy token từ localStorage 
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async fetchCategories() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: this.getHeaders()
            });

            // Xử lý lỗi 401 hoặc 500 từ server
            if (!response.ok) throw new Error('Lỗi kết nối API hoặc Token hết hạn');
            return await response.json();

        } catch (error) {
            console.error("Không thể lấy dữ liệu danh mục:", error);
            // Trả về mảng rỗng để tránh lỗi "undefined" ở View
            return [];
        }
    }

    async searchCategories(name) {
        try {
            // Sửa lỗi 401 khi tìm kiếm bằng cách đính kèm Header
            const response = await fetch(`${this.apiUrl}?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Lỗi khi tìm kiếm hoặc không có quyền');
            return await response.json();
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Không thể thêm danh mục. Kiểm tra quyền Admin!');
        return await response.json();
    }

    async updateCategory(id, categoryData) {
        // Ép kiểu ID sang số nguyên để xóa sạch mọi ký tự lạ (như dấu : hoặc khoảng trắng)
        const cleanId = parseInt(id);

        // Kiểm tra nếu ID không phải là số thì báo lỗi luôn không gọi API nữa
        if (isNaN(cleanId)) throw new Error("ID danh mục không hợp lệ");

        const response = await fetch(`${this.apiUrl}/${cleanId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            // Thử lấy thông báo lỗi chi tiết từ Backend trả về
            const errorDetail = await response.json().catch(() => ({}));
            throw new Error(errorDetail.message || 'Không thể cập nhật danh mục!');
        }
    }

    async deleteCategory(id) {
        const response = await fetch(`${this.apiUrl}/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            // Xử lý lỗi trả về từ Backend
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi không xác định");
            } catch (e) {
                throw new Error("Không thể xóa danh mục này!");
            }
        }
        return true;
    }
}