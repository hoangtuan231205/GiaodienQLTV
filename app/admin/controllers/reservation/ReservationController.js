class ReservationController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.allReservations = [];
    }

    async init() {
        await this.loadReservations();
        this.setupFilters();
        this.setupEventListeners();
    }

    async loadReservations() {
        try {
            this.allReservations = await this.model.fetchReservations();
            this.view.renderReservations(this.allReservations);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đặt sách:", error);
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('search-reservation-input');
        const statusSelect = document.querySelector('.filter-select');

        const applyFilters = () => {
            const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const status = statusSelect ? statusSelect.value : '';
            this.processFilter(keyword, status);
        };

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (statusSelect) statusSelect.addEventListener('change', applyFilters);
    }

    processFilter(keyword, status) {
        let filteredData = this.allReservations;

        if (keyword) {
            const normalizedKeyword = keyword.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();

            filteredData = filteredData.filter(res => {
                const nameText = res.userName ? res.userName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : "";
                const bookNameText = res.bookName ? res.bookName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : "";
                const bookIdText = res.bookId ? String(res.bookId) : "";
                const reservationIdText = res.id ? `res${String(res.id).padStart(3, '0')}` : "";

                return reservationIdText.includes(normalizedKeyword) ||
                    nameText.includes(normalizedKeyword) ||
                    bookIdText.includes(normalizedKeyword) ||
                    bookNameText.includes(normalizedKeyword);
            });
        }

        if (status) {
            filteredData = filteredData.filter(res => res.status === status);
        }

        this.view.renderReservations(filteredData);
    }

    setupEventListeners() {
        const tableBody = document.getElementById("reservation-table-body");
        if (!tableBody) return;

        tableBody.addEventListener("click", async (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const id = btn.dataset.id;

            if (btn.classList.contains("btn-approve")) {
                await this.updateStatus(id, "approved");
            }
            else if (btn.classList.contains("btn-cancel")) {
                if (confirm("Bạn có chắc chắn muốn hủy đơn này?")) {
                    await this.updateStatus(id, "cancelled");
                }
            }
            else if (btn.classList.contains("btn-deliver")) {
                if (confirm("Xác nhận đã giao sách cho độc giả? Hệ thống sẽ tự động tạo phiếu mượn.")) {
                    try {
                        const token = localStorage.getItem("token");

                        // Gọi API chuyển đổi từ Phiếu đặt -> Phiếu mượn
                        const response = await fetch(`/api/v1/loans/from-reservation/${id}`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        const responseText = await response.text();

                        if (!response.ok) {
                            throw new Error(responseText || "Lỗi khi giao sách");
                        }

                        alert(responseText); // Hiện câu "Giao sách và tạo phiếu mượn thành công!"

                        // Tải lại bảng để cập nhật trạng thái phiếu đặt sang "Đã hoàn thành"
                        await this.loadReservations();

                        // Mẹo UX: Chạy lại bộ lọc hiện tại
                        const searchInput = document.getElementById('search-reservation-input');
                        const statusSelect = document.querySelector('.filter-select');
                        this.processFilter(
                            searchInput ? searchInput.value : '',
                            statusSelect ? statusSelect.value : ''
                        );

                    } catch (error) {
                        alert("Thất bại: " + error.message);
                        console.error("Lỗi:", error);
                    }
                }
            }
            else if (btn.classList.contains("btn-detail")) {
                const detail = await this.model.getReservationDetail(id);
                this.view.showDetailModal(detail);
            }
        });
    }

    // Hàm gọi model để cập nhật trạng thái
    async updateStatus(id, status) {
        try {
            const result = await this.model.updateStatus(id, status);
            if (result) {
                alert("Cập nhật trạng thái thành công!");
                await this.loadReservations();

                // Mẹo UX: Tự động chạy lại bộ lọc hiện tại sau khi tải dữ liệu mới
                const searchInput = document.getElementById('search-reservation-input');
                const statusSelect = document.querySelector('.filter-select');
                this.processFilter(
                    searchInput ? searchInput.value : '',
                    statusSelect ? statusSelect.value : ''
                );
            }
        } catch (error) {
            alert("Đã xảy ra lỗi khi cập nhật trạng thái!");
            console.error(error);
        }
    }
}