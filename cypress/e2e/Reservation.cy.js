describe('Kiểm thử chức năng Đặt chỗ (Reservation) với Mock API', () => {
  
  beforeEach(() => {
    // 1. Giả lập người dùng đã đăng nhập (Set token giả vào localStorage)
    window.localStorage.setItem('token', 'fake-jwt-token-for-testing');
    
    // =========================================================
    // 2. SỬ DỤNG CY.INTERCEPT ĐỂ GIẢ LẬP BACKEND TRẢ VỀ DỮ LIỆU
    // =========================================================
    
    // Giả lập API lấy danh sách đặt chỗ hiện tại của người dùng
    cy.intercept('GET', 'http://localhost:8080/api/v1/reservations/details', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Clean Code', author: 'Robert C. Martin', status: 'PENDING' }
      ]
    }).as('getReservations');

    // Giả lập API lấy danh sách tất cả các sách có trong thư viện
    cy.intercept('GET', 'http://localhost:8080/api/v1/books', {
      statusCode: 200,
      body: [
        { id: 101, title: 'Clean Code', author: 'Robert C. Martin' },
        { id: 102, title: 'Lập trình Web Cơ Bản', author: 'Nguyễn Văn A' }
      ]
    }).as('getBooks');

    // 3. Truy cập vào trang Đặt chỗ (File HTML của bạn)
    cy.visit('/reservations.html');
    
    // Đợi Cypress hứng được các API giả lập trên rồi mới chạy test
    cy.wait('@getReservations');
  });

  // ==========================================
  // KIỂM THỬ GIAO DIỆN & CHỨC NĂNG CƠ BẢN
  // ==========================================
  it('TC_UI_01: Kiểm tra form Đặt Chỗ Mới hiển thị đúng cấu trúc', () => {
    cy.get('#new-reservation-btn').click();
    cy.wait('@getBooks');

    cy.get('.reservation-modal-overlay').should('be.visible');
    cy.get('.modal-title').should('contain.text', 'Đặt Chỗ Mới');
    cy.get('#book-search').should('be.visible');
  });

  it('TC_FUNC_01: Hiển thị đúng danh sách sách gợi ý (Autocomplete)', () => {
    cy.get('#new-reservation-btn').click();
    cy.wait('@getBooks');

    // Gõ chữ "Clean" vào ô tìm kiếm
    cy.get('#book-search').type('Clean');

    // Cửa sổ gợi ý phải hiện ra và chứa tên sách 'Clean Code'
    cy.get('.book-suggestions-dropdown').should('be.visible');
    cy.get('.suggestion-title').first().should('contain.text', 'Clean Code');
  });

  // ==========================================
  // KIỂM THỬ LUỒNG NGHIỆP VỤ (END TO END)
  // ==========================================
  it('TC_E2E_01: Luồng Tạo Đặt chỗ thành công', () => {
    // Giả lập API POST (Lưu đặt chỗ) trả về thành công
    cy.intercept('POST', 'http://localhost:8080/api/v1/reservations', {
      statusCode: 200,
      body: { success: true }
    }).as('createReservation');

    // Lắng nghe hộp thoại alert của trình duyệt
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Đặt chỗ thành công');
    });

    cy.get('#new-reservation-btn').click();
    cy.wait('@getBooks');

    // Thao tác người dùng: Tìm và chọn sách
    cy.get('#book-search').type('Clean Code');
    cy.get('.suggestion-item').first().click();

    // Bấm nút Submit (Tạo đặt chỗ)
    cy.get('#reservation-form').submit();

    // Xác minh giao diện đã thực sự gửi đúng BookID (101) lên API
    cy.wait('@createReservation').its('request.body').should('deep.equal', {
      bookId: 101
    });
  });

  it('TC_E2E_02: Luồng Hủy đặt chỗ thành công', () => {
    // Giả lập API DELETE trả về thành công
    cy.intercept('DELETE', 'http://localhost:8080/api/v1/reservations/1', {
      statusCode: 200,
      body: { success: true }
    }).as('cancelReservation');

    // Tự động bấm "OK" khi hộp thoại Confirm hiện lên
    cy.on('window:confirm', () => true);
    
    // Lắng nghe hộp thoại alert thành công
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Hủy đặt chỗ thành công');
    });

    // Bấm nút "Hủy" trên giao diện (row đầu tiên)
    cy.get('.reservation-row[data-reservation-id="1"] button[data-action="cancel"]').click();

    // Xác minh Cypress có hứng được request Xóa gửi đi không
    cy.wait('@cancelReservation');
  });
});