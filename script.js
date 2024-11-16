// تحميل قائمة العملاء
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:3000/customers');
        const customers = await response.json();
        
        updateCustomersList(customers);
        updateCustomersSelect(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        showError('حدث خطأ أثناء تحميل قائمة العملاء');
    }
}

// تحديث قائمة العملاء في الجدول
function updateCustomersList(customers) {
    const customersList = document.getElementById('customersList');
    customersList.innerHTML = customers.map(customer => `
        <tr class="fade-in">
            <td>
                <i class="fas fa-user text-primary"></i>
                ${customer.firstName} ${customer.lastName}
            </td>
            <td>
                <i class="fas fa-phone text-success"></i>
                ${customer.phone}
            </td>
            <td>
                <i class="fas fa-map-marker-alt text-danger"></i>
                ${customer.address}
            </td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewPurchases(${customer.id})">
                    <i class="fas fa-shopping-bag"></i>
                    عرض المشتريات
                </button>
            </td>
        </tr>
    `).join('');
}

// تحديث قائمة العملاء في نموذج المشتريات
function updateCustomersSelect(customers) {
    const customerSelect = document.querySelector('[name="customerId"]');
    customerSelect.innerHTML = '<option value="">اختر العميل</option>' + 
        customers.map(customer => `
            <option value="${customer.id}">
                ${customer.firstName} ${customer.lastName}
            </option>
        `).join('');
}

// إضافة عميل جديد
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:3000/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
        });

        if (response.ok) {
            showSuccess('تم إضافة العميل بنجاح');
            e.target.reset();
            loadCustomers();
        } else {
            const error = await response.json();
            showError(error.message || 'حدث خطأ أثناء إضافة العميل');
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        showError('حدث خطأ أثناء إضافة العميل');
    }
});

// إضافة مشتريات
document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const purchaseData = Object.fromEntries(formData.entries());
    purchaseData.customerId = parseInt(purchaseData.customerId);
    purchaseData.amount = parseFloat(purchaseData.amount);

    try {
        const response = await fetch('http://localhost:3000/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData),
        });

        if (response.ok) {
            showSuccess('تم إضافة المشتريات بنجاح');
            e.target.reset();
        } else {
            const error = await response.json();
            showError(error.message || 'حدث خطأ أثناء إضافة المشتريات');
        }
    } catch (error) {
        console.error('Error adding purchase:', error);
        showError('حدث خطأ أثناء إضافة المشتريات');
    }
});

// عرض مشتريات العميل
async function viewPurchases(customerId) {
    try {
        const response = await fetch(`http://localhost:3000/customers/${customerId}/purchases`);
        const purchases = await response.json();
        
        if (purchases.length === 0) {
            Swal.fire({
                title: 'لا توجد مشتريات',
                text: 'لا توجد مشتريات مسجلة لهذا العميل',
                icon: 'info',
                confirmButtonText: 'حسناً'
            });
            return;
        }

        const purchasesList = purchases.map(purchase => `
            <div class="purchase-item mb-3 p-3 border-bottom">
                <div class="d-flex justify-content-between">
                    <strong>التاريخ:</strong>
                    <span>${new Date(purchase.date).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <strong>المبلغ:</strong>
                    <span>${purchase.amount} د.ك</span>
                </div>
                <div class="mt-2">
                    <strong>الوصف:</strong>
                    <p class="mb-0">${purchase.description}</p>
                </div>
            </div>
        `).join('');

        Swal.fire({
            title: 'سجل المشتريات',
            html: `<div class="purchases-list">${purchasesList}</div>`,
            width: '600px',
            confirmButtonText: 'إغلاق'
        });
    } catch (error) {
        console.error('Error loading purchases:', error);
        showError('حدث خطأ أثناء تحميل المشتريات');
    }
}

// عرض رسالة نجاح
function showSuccess(message) {
    Swal.fire({
        title: 'تم بنجاح!',
        text: message,
        icon: 'success',
        confirmButtonText: 'حسناً'
    });
}

// عرض رسالة خطأ
function showError(message) {
    Swal.fire({
        title: 'خطأ!',
        text: message,
        icon: 'error',
        confirmButtonText: 'حسناً'
    });
}

// تحميل البيانات عند بدء التطبيق
loadCustomers();