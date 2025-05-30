<template>
    <div class="product-list">
        <h2>Danh Sách Sản Phẩm</h2>
        <table>
            <thead>
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Loại</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>{{ product.price | currency }}</td>
                    <td>{{ product.category }}</td>
                    <td>
                        <button @click="viewProduct(product)">Xem</button>
                        <button @click="editProduct(product)">Sửa</button>
                        <button @click="deleteProduct(product.id)">Xóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "ProductList",
    data() {
        return {
            products: [
                { id: 1, name: "Bàn làm việc", price: 2500000, category: "Nội thất" },
                { id: 2, name: "Ghế xoay", price: 1200000, category: "Nội thất" },
                { id: 3, name: "Đèn bàn", price: 350000, category: "Thiết bị điện" },
                { id: 4, name: "Tủ sách", price: 1800000, category: "Nội thất" }
            ]
        };
    },
    methods: {
        viewProduct(product) {
            alert(`Xem sản phẩm: ${product.name}`);
        },
        editProduct(product) {
            alert(`Sửa sản phẩm: ${product.name}`);
        },
        deleteProduct(id) {
            this.products = this.products.filter(p => p.id !== id);
        }
    },
    filters: {
        currency(value) {
            return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
    }
};
</script>

<style scoped>
.product-list {
    max-width: 700px;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
table {
    width: 100%;
    border-collapse: collapse;
}
th, td {
    padding: 12px 8px;
    border-bottom: 1px solid #eee;
    text-align: left;
}
th {
    background: #f5f5f5;
}
button {
    margin-right: 8px;
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    background: #1976d2;
    color: #fff;
    cursor: pointer;
}
button:last-child {
    background: #e53935;
}
button:hover {
    opacity: 0.85;
}
</style>