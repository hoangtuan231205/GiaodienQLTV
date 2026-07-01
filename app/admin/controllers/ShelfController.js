class ShelfController {
    constructor(model, view, categoryModel) {
        this.model = model;
        this.view = view;
        this.currentSearch = "";
        this.currentFloor = "";
        this.categoryModel = categoryModel;
    }

    async init() {
        // Load dữ liệu lần đầu
        await this.loadShelves();
        // Load danh sách Thể loại để đổ vào Dropdown trong Modal
        try {
            const categories = await this.categoryModel.fetchCategories();
            this.view.renderCategoryDropdown(categories); // Hàm này ông viết thêm ở ShelfView
        } catch (error) {
            console.error("Lỗi load categories:", error);
        }
        // Gắn sự kiện
        this.view.bindEvents({
            handleSearch: (name) => this.loadShelves(name),
            handleFilter: (floor) => this.loadShelves(this.currentSearch, floor),
            handleEdit: (id) => this.editShelf(id),
            handleDelete: (id) => this.deleteShelf(id),
            handleSave: (id, data) => this.handleSave(id, data)
        });
    }
    async loadData() {
        // Gửi cả tên và tầng qua Model để lọc
        const shelves = await this.model.fetchShelves(this.currentSearch, this.currentFloor);
        this.view.renderShelves(shelves);
    }

    async loadShelves(name = "") {
        const shelves = await this.model.fetchShelves(name);
        this.view.renderShelves(shelves);
    }

    async deleteShelf(id) {
        const success = await this.model.deleteShelf(id);
        if (success) {
            alert("✅ Xóa kệ sách thành công!"); // Thông báo nhanh
            await this.loadShelves(); 
        } else {
            alert("❌ Lỗi: Không thể xóa. Check lại quyền Admin nhé Dương!");
        }
    }

    async editShelf(id) {
    try {
        // Gọi Model lấy dữ liệu chi tiết của kệ
        const shelf = await this.model.getShelfById(id);
        if (shelf) {
            // Gọi View để hiển thị Modal và đổ dữ liệu vào
            this.view.showModal(shelf); 
        }
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết kệ:", error);
        alert("Không thể lấy dữ liệu kệ để sửa!");
    }
}
    async handleSave(id, data) {
        let success;
        if (id) {
            success = await this.model.updateShelf(id, data);
        } else {
            success = await this.model.createShelf(data);
        }

        if (success) {
            alert(id ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
            this.view.shelfModal.hide(); // Đóng Modal
            await this.loadShelves();    // Load lại bảng dữ liệu
        } else {
            alert("❌ Có lỗi xảy ra khi lưu dữ liệu!");
        }
    }
}
// done shelf controller