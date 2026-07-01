class FineModel {
    constructor() {
        this.baseUrl = '/api/v1/fines';
    }

    // 1. Lấy danh sách phạt
    async fetchFines() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(this.baseUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Lỗi kết nối API lấy danh sách phạt");
            return await response.json();
        } catch (error) {
            console.warn("Không kết nối được API, đang sử dụng Mock Data...");
            // MOCK DATA: Dữ liệu giả định để test UI
            return [
                { id: 1, loanDetailId: 42, userName: "Mẫu", reason: "Quá hạn 5 ngày", amount: 25000, isPaid: false }
            ];
        }
    }

    // 2. Thu tiền phạt
    async payFine(fineId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${this.baseUrl}/${fineId}/pay`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg);
            }
            return await response.text();
        } catch (error) {
            console.error("Lỗi khi thu tiền phạt:", error);
            throw error;
        }
    }

    async createManualFine(fineData) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(fineData)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg);
            }
            return await response.text(); // Trả về thông báo thành công
        } catch (error) {
            console.error("Lỗi khi tạo phạt:", error);
            throw error;
        }
    }
}