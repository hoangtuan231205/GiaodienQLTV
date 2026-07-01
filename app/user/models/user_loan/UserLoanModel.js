class UserLoanModel {
    constructor() {
        this.apiUrl = '/api/v1/loans/user';
    }

    // Hàm gọi API lấy danh sách phiếu mượn
    async fetchUserLoans(userId, token) {
        try {
            const response = await fetch(`${this.apiUrl}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Không thể tải lịch sử mượn sách từ máy chủ.");
            }

            const responseData = await response.json();
            return responseData.data || responseData.content || responseData;

        } catch (error) {
            console.error("Lỗi Model:", error);
            throw error;
        }
    }
}