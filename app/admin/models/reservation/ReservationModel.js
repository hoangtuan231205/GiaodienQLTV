class ReservationModel {
    constructor() {
        this.baseUrl = '/api/v1/reservations';
    }

    async fetchReservations() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(this.baseUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Lỗi kết nối API lấy danh sách đặt sách");

            const rawData = await response.json();

            return rawData.map(item => {
                let formattedDate = "";
                if (item.reservation_date) {
                    const dateObj = new Date(item.reservation_date);
                    const datePart = dateObj.toLocaleDateString('vi-VN');
                    const timePart = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    formattedDate = `${datePart} ${timePart}`;
                }

                return {
                    id: item.id,
                    userName: item.userName || "Lỗi tên",
                    userEmail: item.userEmail || "Không có email",
                    bookName: item.bookName || "Lỗi tên sách",
                    reservation_date: formattedDate,
                    status: item.status
                };
            });

        } catch (error) {
            console.warn("Không kết nối được API, đang sử dụng Mock Data...", error);
            return [];
        }
    }

    async updateStatus(id, newStatus) {
        const token = localStorage.getItem("token");
        const response = await fetch(`${this.baseUrl}/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error((errorData && errorData.message) ? errorData.message : "Không thể cập nhật trạng thái");
        }

        return await response.json();
    }

    async getReservationDetail(id) {
        return this.fetchReservations().then(list => list.find(item => item.id == id));
    }
}