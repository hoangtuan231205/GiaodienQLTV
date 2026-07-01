class ShelfModel {
    // Hàm phụ để lấy token bảo mật
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async fetchShelves(name = "", floor = "") {
        try {
            const url = new URL('/api/v1/shelves');

            // Chỉ thêm params nếu có giá trị thực
            if (name) url.searchParams.append('name', name);
            if (floor) url.searchParams.append('floor', floor);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            // Xử lý lỗi Token hết hạn (401)
            if (response.status === 401) {
                alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại nhé!");
                window.location.href = "/login.html";
                return [];
            }

            if (!response.ok) throw new Error('Lỗi kết nối API');

            return await response.json();

        } catch (error) {
            console.error("Không thể lấy dữ liệu kệ sách:", error);
            // Trả về mảng rỗng thay vì dữ liệu ảo để ông dễ debug lỗi API
            return [];
        }
    }

    async createShelf(shelfData) {
        const response = await fetch('/api/v1/shelves', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(shelfData)
        });
        if (!response.ok) throw new Error('Lỗi khi thêm kệ sách');
        return await response.json();
    }

    // Lấy 1 kệ để sửa
    async getShelfById(id) {
        const response = await fetch(`/api/v1/shelves/${id}`, {
            headers: this.getHeaders()
        });
        return await response.json();
    }

    // Cập nhật kệ
    async updateShelf(id, shelfData) {
        const response = await fetch(`/api/v1/shelves/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(shelfData)
        });
        return response.ok;
    }

    // Xóa kệ
    async deleteShelf(id) {
        const response = await fetch(`/api/v1/shelves/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return response.ok;
    }
}