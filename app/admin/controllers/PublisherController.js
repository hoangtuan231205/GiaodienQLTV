class PublisherController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async init() {
        await this.loadPublishers();
        
        // --- PHẦN VIẾT THÊM: Khởi tạo các sự kiện ---
        this.view.bindAddPublisher();
        this.view.bindSavePublisher(this.handleSave.bind(this));
        this.view.bindTableActions(this.handleEdit.bind(this), this.handleDelete.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));
    }

    async loadPublishers() {
        const publishers = await this.model.fetchPublishers();
        this.view.renderPublishers(publishers);
    }

    // Xử lý Lưu (Thêm/Sửa)
    async handleSave(id, data) {
        try {
            if (id) {
                await this.model.updatePublisher(id, data);
            } else {
                await this.model.createPublisher(data);
            }
            alert("Thao tác thành công!");
            location.reload(); 
        } catch (error) {
            alert("Lỗi rồi!");
        }
    }

    // Xử lý khi bấm nút Sửa
    async handleEdit(id) {
        const pub = await this.model.getPublisherById(id);
        this.view.fillForm(pub);
    }

    // Xử lý Xóa
    async handleDelete(id) {
        const success = await this.model.deletePublisher(id);
        if (success) {
            this.loadPublishers();
        }
    }

    // Xử lý Tìm kiếm (Filter ngay trên mảng hiện có cho nhanh)
    handleSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    const filtered = this.allPublishers.filter(p => {
        // 1. Tạo mã hiển thị ảo giống hệt lúc render (ví dụ: DM001)
        const virtualId = `NXB${String(p.id).padStart('3')}`.toLowerCase();
        
        // 2. Lấy ID thuần số (ví dụ: 1)
        const realId = String(p.id);

        // 3. So khớp: Tên chứa query HOẶC Mã ảo chứa query HOẶC ID thực chứa query
        return p.name.toLowerCase().includes(searchTerm) || 
               virtualId.includes(searchTerm) ||
               realId.includes(searchTerm);
    });

    this.view.renderPublishers(filtered);
}
}
// done publisher controller