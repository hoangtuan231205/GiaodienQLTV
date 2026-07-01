class FineView {
    constructor() {
        this.tableBody = document.getElementById("fine-table-body");
    }

    renderFines(fines) {
        if (!this.tableBody) return;

        if (fines.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Không có dữ liệu tiền phạt.</td></tr>`;
            return;
        }

        this.tableBody.innerHTML = fines.map(fine => {
            // Định dạng tiền tệ VNĐ (Ví dụ: 25000 -> 25,000)
            const formattedAmount = new Intl.NumberFormat('vi-VN').format(fine.amount) + " đ";
            
            // Xử lý Giao diện theo Trạng thái (Đã đóng hay Chưa đóng)
            let statusHtml = '';
            let actionHtml = '';
            let amountClass = 'fine-amount'; // Màu mặc định

            if (fine.isPaid) {
                statusHtml = `<span class="status-paid"><span class="status-dot"></span>Đã đóng</span>`;
                amountClass += ' paid'; // Đổi màu xám mờ cho tiền đã thu
                // Nút xem biên lai (Chỉ hiển thị cho đẹp, vô hiệu hóa)
                actionHtml = `<button class="btn-action text-muted" title="Đã hoàn tất" disabled><i class="fas fa-check-circle"></i></button>`;
            } else {
                statusHtml = `<span class="status-unpaid"><span class="status-dot"></span>Chưa đóng</span>`;
                // Nút thu tiền
                actionHtml = `<button class="btn-action pay btn-pay-fine" data-id="${fine.id}" title="Xác nhận đã thu tiền"><i class="fas fa-hand-holding-usd text-success"></i></button>`;
            }

            return `
                <tr>
                    <td class="ps-4 fw-medium text-dark">F${String(fine.id).padStart(3, '0')}</td>
                    <td><span class="fw-medium text-primary">MP${String(fine.loanDetailId).padStart(3, '0')}</span></td>
                    <td>
                        <div class="fw-medium text-dark">${fine.userName}</div>
                    </td>
                    <td class="text-muted">${fine.reason}</td>
                    <td class="${amountClass}">${formattedAmount}</td>
                    <td>${statusHtml}</td>
                    <td class="text-center pe-4">${actionHtml}</td>
                </tr>
            `;
        }).join("");
    }

    // Bắt sự kiện bấm nút Thu tiền
    bindPayAction(payHandler) {
        if (!this.tableBody) return;
        this.tableBody.addEventListener("click", (e) => {
            const btnPay = e.target.closest(".btn-pay-fine");
            if (btnPay) {
                const fineId = btnPay.dataset.id;
                if (confirm("Xác nhận độc giả đã thanh toán!")) {
                    payHandler(fineId);
                }
            }
        });
    }

    bindCreateFine(handler) {
        const form = document.getElementById("create-fine-form");
        if (!form) return;
        
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fineData = {
                // Lấy đúng format DTO Backend yêu cầu: loanDetailId, amount, reason
                loanDetailId: document.getElementById("fine-loan-detail-id").value,
                amount: document.getElementById("fine-amount").value,
                reason: document.getElementById("fine-reason").value
            };
            handler(fineData); // Ném qua Controller xử lý
        });
    }

    // Tắt Modal sau khi tạo xong
    closeCreateModal() {
        const modalEl = document.getElementById("createFineModal");
        if (modalEl) {
            bootstrap.Modal.getInstance(modalEl).hide();
            document.getElementById("create-fine-form").reset(); // Xóa sạch form
        }
    }
}