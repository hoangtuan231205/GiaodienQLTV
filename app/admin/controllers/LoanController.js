class LoanController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.allLoans = []; 
    
    this.currentStatusFilter = "all"; 
    this.currentKeyword = "";    
    
    this.cachedUsers = [];
    this.cachedBooks = [];

    // Liên kết sự kiện tạo mới
    this.view.bindAddLoan(this.handleAddLoan.bind(this));
    this.view.bindTableActions(this.handleDeleteLoan.bind(this), this.handleViewDetail.bind(this));
    this.view.bindSubmitRenew(this.handleRenewLoan.bind(this));
    this.view.bindSubmitReturn(this.handleReturnLoan.bind(this));

  }

  async init() {
    await this.loadLoans(); 
    this.setupSearch(); 

    this.cachedBooks = await this.model.fetchAllBooks();
    this.cachedUsers = await this.model.fetchAllUsers();

    this.view.bindStatusFilter((status) => {
      this.currentStatusFilter = status;
      this.filterLoans(); // Gọi hàm xử lý chung
    });

    this.view.bindSearchUser((keyword) => {
      const lowerKw = keyword.toLowerCase();
      const results = this.cachedUsers.filter(user => {
        const idText = String(user.id).toLowerCase();
        const nameText = String(user.fullName || user.name || "").toLowerCase();
        return idText.includes(lowerKw) || nameText.includes(lowerKw);
      });
      this.view.renderUserSuggestions(results);
    });

    this.view.bindSearchBook((keyword) => {
      const lowerKw = keyword.toLowerCase();
      // Dùng hàm filter của JS để tìm kiếm
      const results = this.cachedBooks.filter(book => {
        const idText = String(book.id).toLowerCase();
        const titleText = String(book.title || book.name || "").toLowerCase();
        return idText.includes(lowerKw) || titleText.includes(lowerKw);
      });
      this.view.renderBookSuggestions(results);
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('search-loan-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentKeyword = e.target.value.toLowerCase().trim();
        this.filterLoans(); 
      });
    }
  }

  filterLoans() {
    let filteredData = this.allLoans;

    const currentTab = (this.currentStatusFilter || "all").toLowerCase().trim();

    if (currentTab !== "all") {
      filteredData = filteredData.filter(loan => {
        const status = (loan.status || "").toLowerCase();
        return status === currentTab; 
      });
      
    }

    if (this.currentKeyword) {
      filteredData = filteredData.filter(loan => {
        const idText = loan.id ? loan.id.toString().toLowerCase() : "";
        const nameText = (loan.userName || loan.user_name || "").toLowerCase(); 
        return idText.includes(this.currentKeyword) || nameText.includes(this.currentKeyword);
      });
    }

    this.view.renderLoans(filteredData);
  }

  async loadLoans() {
    try {
      const loans = await this.model.fetchLoans();
      this.allLoans = loans || [];
      
      this.filterLoans(); 
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    }
  }

  async handleAddLoan(loanData) {
    try {
      await this.model.createLoan(loanData);
      alert("Tạo phiếu mượn thành công!");
      this.view.closeAddModal(); 
      await this.loadLoans(); 
    } catch (error) {
      alert("Lỗi: " + error.message); 
    }
  }

  async handleDeleteLoan(rawId) {
    try {
      const cleanId = rawId.toString().replace(/\D/g, ''); 
      await this.model.deleteLoan(cleanId);
      alert("Xóa phiếu mượn thành công!");
      await this.loadLoans(); 
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    }
  }

  async handleRenewLoan(rawDetailId, requestData) {
    try {
      const cleanDetailId = rawDetailId.toString().replace(/\D/g, '');
      await this.model.renewBook(cleanDetailId, requestData);
      alert("Gia hạn sách thành công!");
      this.view.closeRenewModal();
      await this.loadLoans(); 
    } catch (error) {
      alert("Lỗi gia hạn: " + error.message);
    }
  }

  async handleReturnLoan(rawDetailId, requestData) {
  try {
    const cleanDetailId = rawDetailId.toString().replace(/\D/g, '');
    
    const loan = this.allLoans.find(l => String(l.loanDetailId || l.id) === String(cleanDetailId));
    if (loan && requestData.inputBarcode !== loan.barcode) {
        document.getElementById("barcode-error-msg")?.classList.remove("d-none");
        return; 
    }

    await this.model.returnBook(cleanDetailId, requestData);

    alert("Trả sách và đối chiếu thành công!");
    this.view.closeReturnModal();
    await this.loadLoans(); 
  } catch (error) {
    alert("Lỗi hệ thống: " + error.message);
  }
}

  handleViewDetail(detailId) {
    const loan = this.allLoans.find(l => String(l.loanDetailId || l.id) === String(detailId));
    if (loan) {
        // Gửi barcode và note sang View để hiển thị
        this.view.showDetailModal(loan.barcode, loan.note);
    }
  }
}
// loancontroller