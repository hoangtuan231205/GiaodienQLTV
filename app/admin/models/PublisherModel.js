class PublisherModel {
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Đính kèm token dạng Bearer để vượt lỗi 401
        };
    }
    async fetchPublishers() {
        try {
            // Thay URL này bằng đường dẫn API thật của bạn (ví dụ: /api/v1/publishers)
            const response = await fetch('/api/v1/publishers', {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error('Lỗi kết nối API');
            return await response.json();

        } catch (error) {
            console.error("Không thể lấy dữ liệu nhà xuất bản:", error);
            // Trả về dữ liệu mẫu dựa trên file SQL library_db để test
            return [
                {
                    "id": 1, "name": "NXB Giáo Dục", "address": "Hà Nội, Việt Nam",
                    "email": "contact@giaoduc.vn", "createdAt": "2026-03-05 23:44:55"
                },
                {
                    "id": 2, "name": "NXB Công Nghệ", "address": "TP Hồ Chí Minh, Việt Nam",
                    "email": "info@congnghe.vn", "createdAt": "2026-03-05 23:44:55"
                }
            ];
        }
    }

    async createPublisher(publisherData) {
        try {
            const response = await fetch('/api/v1/publishers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(publisherData)
            });

            if (!response.ok) throw new Error('Lỗi khi thêm nhà xuất bản');
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi thêm nhà xuất bản:", error);
            throw error;
        }
    }
    // Lấy 1 NXB theo ID để sửa
    async getPublisherById(id) {
        const response = await fetch(`/api/v1/publishers/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error('Không lấy được thông tin NXB');
        return await response.json();
    }

    // Cập nhật NXB
    async updatePublisher(id, data) {
        // --- PHẦN VIẾT THÊM: Token cho phương thức PUT ---
        const response = await fetch(`/api/v1/publishers/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Không thể cập nhật NXB');
        return await response.json();
    }


    // Xóa NXB
    async deletePublisher(id) {
        // --- PHẦN VIẾT THÊM: Token cho phương thức DELETE ---
        const response = await fetch(`/api/v1/publishers/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lỗi khi xóa nhà xuất bản");
        }
        return true;
    }
}