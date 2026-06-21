describe('Kiểm thử chức năng Mượn sách & Đặt chỗ với Mock API', () => {

    beforeEach(() => {
        // 1. Giả lập người dùng đã đăng nhập (Set token giả vào localStorage)
        window.localStorage.setItem('token', 'fake-jwt-token-for-testing');

        // =========================================================
        // 2. GIẢ LẬP ĐƯỜNG DẪN TẢI THÀNH PHẦN (COMPONENT TEMPLATE)
        // =========================================================
        // Vì mã nguồn JavaScript của bạn sử dụng lệnh fetch để lấy tệp HTML thành phần,
        // ta chặn lệnh fetch này và trả về trực tiếp nội dung để tránh lỗi 404 trên máy ảo.
        cy.intercept('GET', '/app/user/components/BorrowForm.html', {
            statusCode: 200,
            body: `
        <template id="borrow-form-template">
          <div class="borrow-modal-overlay">
            <div class="borrow-modal">
              <div class="modal-header">
                <h2 class="modal-title">📚 Mượn Sách</h2>
                <button class="modal-close-btn" type="button"><span>&times;</span></button>
              </div>
              <form id="borrow-form" class="borrow-form">
                <div class="form-group" id="book-select-group" style="display:none;">
                  <label for="book-select">Chọn Sách</label>
                  <select id="book-select" name="bookSelect" class="form-control">
                    <option value="">-- Chọn một sách --</option>
                  </select>
                </div>
                <div class="form-group" id="book-title-group">
                  <label for="book-title-display">Tên Sách</label>
                  <input type="text" id="book-title-display" class="form-control" readonly>
                  <input type="hidden" id="book-id" name="bookId" value="">
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">✓ Xác nhận mượn</button>
                </div>
              </form>
            </div>
          </div>
        </template>
      `
        }).as('getTemplate');

        // Giả lập API lấy danh sách tất cả các sách có trong thư viện
        cy.intercept('GET', 'http://localhost:8080/api/v1/books', {
            statusCode: 200,
            body: [
                { id: 101, title: 'Clean Code', author: 'Robert C. Martin' },
                { id: 102, title: 'Lập trình Web Cơ Bản', author: 'Nguyễn Văn A' }
            ]
        }).as('getBooks');

        // 3. Truy cập vào trang chủ (Nơi chứa mã khởi chạy giao diện của bạn)
        // Ép bỏ qua check status code để cô lập hoàn toàn môi trường Front-End
        cy.visit('/', { failOnStatusCode: false });

        // Kích hoạt nạp thành phần động vào cửa sổ Window của trình duyệt thử nghiệm
        cy.window().then(async (win) => {
            // Giả lập luồng khởi tạo Component ở chế độ Đặt/Mượn một cuốn sách (Single Mode)
            // Khớp chính xác với kiến trúc hàm khởi tạo: BorrowForm.create({ book: ... }) trong file JS của bạn
            if (win.BorrowForm) {
                const modalElement = await win.BorrowForm.create({
                    mode: 'single',
                    book: { id: 101, title: 'Clean Code' },
                    onSubmit: async (data) => {
                        // Chuyển tiếp dữ liệu submit sang một API giả lập endpoint POST để Cypress theo dõi
                        return fetch('http://localhost:8080/api/v1/reservations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        }).then(res => res.json());
                    }
                });
                win.document.body.appendChild(modalElement);
            }
        });
    });

    // ==========================================
    // KIỂM THỬ GIAO DIỆN & CẤU TRÚC THÀNH PHẦN
    // ==========================================
    it('TC_UI_01: Kiểm tra form Mượn Sách hiển thị đúng cấu trúc và nạp đúng tiêu đề', () => {
        // Xác minh Modal nổi đã hiển thị thành công trên màn hình trang chủ
        cy.get('.borrow-modal-overlay').should('be.visible');
        cy.get('.modal-title').should('contain.text', 'Mượn Sách');

        // Kiểm tra xem input readonly có hiển thị đúng tên sách "Clean Code" được truyền từ Object vào không
        cy.get('#book-title-display').should('have.value', 'Clean Code');
        cy.get('#book-id').should('have.value', '101');
    });

    // ==========================================
    // KIỂM THỬ LUỒNG NGHIỆP VỤ (END TO END MOCK)
    // ==========================================
    it('TC_E2E_01: Luồng Xác nhận mượn sách gửi đúng dữ liệu ID lên hệ thống', () => {
        // Giả lập API POST (Lưu yêu cầu mượn/đặt chỗ) trả về thành công
        cy.intercept('POST', 'http://localhost:8080/api/v1/reservations', {
            statusCode: 200,
            body: { success: true }
        }).as('createReservation');

        // Thực hiện hành động: Bấm nút Xác nhận mượn trên biểu mẫu
        cy.get('#borrow-form').submit();

        // Xác minh và kiểm tra sâu (Deep Equal): Hệ thống tự động gửi đúng cấu trúc Object
        // Chứa thuộc tính bookId kiểu số (int) lên server (khớp chuẩn logic form.querySelector('#book-id').value)
        cy.wait('@createReservation').its('request.body').should('deep.equal', {
            bookId: 101
        });
    });
});