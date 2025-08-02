        // User Authentication System
        const users = {
            'cashier01': { 
                password: 'cash123', 
                role: 'cashier', 
                name: 'John Cashier',
                permissions: ['sale', 'refund', 'hold_recall']
            },
            'cashier02': { 
                password: 'cash456', 
                role: 'cashier', 
                name: 'Mary Cashier',
                permissions: ['sale', 'refund', 'hold_recall']
            },
            'manager01': { 
                password: 'mgr456', 
                role: 'manager', 
                name: 'James Manager',
                permissions: ['sale', 'refund', 'hold_recall', 'discount', 'void', 'reports']
            },
            'admin': { 
                password: 'admin789', 
                role: 'admin', 
                name: 'System Admin',
                permissions: ['all']
            }
        };

        let currentUser = null;
        let sessionActive = false;

        // POS System State
        let currentSale = {
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0
        };

        let heldOrders = [];
        let lastTransaction = null;

        // Configuration System
        let configData = {
            items: [],
            groups: [],
            units: [],
            taxRates: [],
            printers: [],
            users: [],
            storeProfile: {},
            systemSettings: {}
        };

        // Sample product database
        const productDatabase = {
            '12345': { name: 'Coca Cola 12oz', price: 1.99, taxable: true, ebtEligible: false, department: 'SODA' },
            '23456': { name: 'Bananas per lb', price: 0.79, taxable: false, ebtEligible: true, department: 'PRODUCE' },
            '34567': { name: 'Milk Gallon', price: 3.49, taxable: false, ebtEligible: true, department: 'DAIRY' },
            '45678': { name: 'Ground Beef per lb', price: 4.99, taxable: false, ebtEligible: true, department: 'MEAT' },
            '56789': { name: 'Marlboro Red', price: 8.99, taxable: true, ebtEligible: false, department: 'CIGARETTES' },
            '67890': { name: 'White Bread', price: 2.49, taxable: false, ebtEligible: true, department: 'BAKERY' }
        };

        // Department items for quick access
        const departmentItems = {
            'MEAT': [
                { name: 'Ground Beef (lb)', price: 4.99, taxable: false, ebtEligible: true },
                { name: 'Chicken Breast (lb)', price: 5.99, taxable: false, ebtEligible: true },
                { name: 'Pork Chops (lb)', price: 3.99, taxable: false, ebtEligible: true }
            ],
            'PRODUCE': [
                { name: 'Bananas (lb)', price: 0.79, taxable: false, ebtEligible: true },
                { name: 'Apples (lb)', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Tomatoes (lb)', price: 2.49, taxable: false, ebtEligible: true }
            ],
            'DAIRY': [
                { name: 'Milk Gallon', price: 3.49, taxable: false, ebtEligible: true },
                { name: 'Eggs Dozen', price: 2.99, taxable: false, ebtEligible: true },
                { name: 'Cheese Slices', price: 4.49, taxable: false, ebtEligible: true }
            ],
            'SODA': [
                { name: 'Coca Cola 12oz', price: 1.99, taxable: true, ebtEligible: false },
                { name: 'Pepsi 12oz', price: 1.99, taxable: true, ebtEligible: false },
                { name: 'Sprite 12oz', price: 1.99, taxable: true, ebtEligible: false }
            ],
            'BAKERY': [
                { name: 'White Bread', price: 2.49, taxable: false, ebtEligible: true },
                { name: 'Brown Bread', price: 2.99, taxable: false, ebtEligible: true },
                { name: 'Buns', price: 1.99, taxable: false, ebtEligible: true }
            ],
            'BEVERAGES': [
                { name: 'Water 12oz', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Juice 12oz', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Tea 12oz', price: 1.99, taxable: false, ebtEligible: true }
            ],
            'SNACKS': [
                { name: 'Chips', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Cookies', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Candy', price: 1.99, taxable: false, ebtEligible: true }
            ],
            'OTHER': [
                { name: 'Soap', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Toilet Paper', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Paper Towels', price: 1.99, taxable: false, ebtEligible: true }
            ],
            'FROZEN': [
                { name: 'Ice Cream', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Frozen Pizza', price: 1.99, taxable: false, ebtEligible: true },
                { name: 'Frozen Vegetables', price: 1.99, taxable: false, ebtEligible: true }
            ],
            'CIGARETTES': [
                { name: 'Marlboro Red', price: 8.99, taxable: true, ebtEligible: false },
                { name: 'Marlboro Menthol', price: 8.99, taxable: true, ebtEligible: false },
                { name: 'Marlboro Menthol', price: 8.99, taxable: true, ebtEligible: false }
            ]
        };

        // Initialize system
        document.addEventListener('DOMContentLoaded', function() {
            initializeLogin();
            
            // Check if user is already logged in (session persistence)
            const savedUser = sessionStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showPOSSystem();
            } else {
                showLoginScreen();
            }
        });

        // Login System Functions
        function initializeLogin() {
            const loginForm = document.getElementById('loginForm');
            const logoutBtn = document.getElementById('logoutBtn');
            
            loginForm.addEventListener('submit', handleLogin);
            logoutBtn.addEventListener('click', handleLogout);
            
            // Focus username field
            document.getElementById('username').focus();
        }

        function handleLogin(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            // Clear previous errors
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            // Validate credentials
            if (users[username] && users[username].password === password) {
                // Successful login
                currentUser = {
                    username: username,
                    name: users[username].name,
                    role: users[username].role,
                    permissions: users[username].permissions
                };
                
                // Save session
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                sessionActive = true;
                
                // Show POS system
                showPOSSystem();
                
                // Log successful login
                console.log('Login successful:', currentUser.name, 'Role:', currentUser.role);
                
            } else {
                // Failed login
                showLoginError('Invalid username or password');
                
                // Clear password field
                document.getElementById('password').value = '';
                document.getElementById('username').focus();
                
                // Log failed attempt
                console.log('Login failed for username:', username);
            }
        }

        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear session
                currentUser = null;
                sessionActive = false;
                sessionStorage.removeItem('currentUser');
                
                // Clear any active sale
                if (currentSale.items.length > 0) {
                    if (confirm('There is an active sale. Hold this order before logout?')) {
                        holdOrder();
                    } else {
                        currentSale = { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 };
                    }
                }
                
                // Show login screen
                showLoginScreen();
                
                console.log('User logged out');
            }
        }

        function showLoginScreen() {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('posSystem').style.display = 'none';
            document.querySelector('.status-bar').style.display = 'none';
            
            // Clear login form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('loginError').style.display = 'none';
            
            // Focus username field
            setTimeout(() => {
                document.getElementById('username').focus();
            }, 100);
        }

        function showPOSSystem() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('posSystem').style.display = 'grid';
            document.querySelector('.status-bar').style.display = 'flex';
            
            // Update user info in header
            document.getElementById('loggedInUser').textContent = currentUser.name;
            
            // Initialize POS functions
            initializePOS();
            
            // Initialize configuration menu
            initializeConfigMenu();
            
            // Update status bar with user info
            updateStatusBar('Welcome, ' + currentUser.name + ' (' + currentUser.role.toUpperCase() + ')');
        }

        function showLoginError(message) {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        function hasPermission(action) {
            if (!currentUser) return false;
            if (currentUser.permissions.includes('all')) return true;
            return currentUser.permissions.includes(action);
        }

        function initializePOS() {
            updateDateTime();
            setInterval(updateDateTime, 1000);
            
            // Auto-focus barcode input
            document.getElementById('barcodeInput').focus();
            
            // Enter key support for barcode input
            document.getElementById('barcodeInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addItemByBarcode();
                }
            });
            
            // Update cashier name in status bar
            document.getElementById('cashierName').textContent = currentUser.name;
        }

        // Configuration Menu System
        function initializeConfigMenu() {
            // Add click handlers for menu options
            document.querySelectorAll('.menu-option').forEach(option => {
                option.addEventListener('click', function() {
                    const configType = this.dataset.config;
                    openConfigModal(configType);
                });
            });

            // Hide menu bar for non-admin users in basic version
            const menuBar = document.getElementById('configMenuBar');
            if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
                menuBar.style.display = 'none';
            } else {
                menuBar.style.display = 'flex';
            }
        }

        function openConfigModal(configType) {
            if (!hasPermission('all') && currentUser.role !== 'manager') {
                alert('Access denied: Administrative privileges required');
                return;
            }

            const modal = document.getElementById('configModal');
            const title = document.getElementById('configTitle');
            const content = document.getElementById('configContent');

            // Set title and load content based on config type
            const configInfo = getConfigInfo(configType);
            title.textContent = configInfo.title;
            content.innerHTML = configInfo.content;

            // Show modal
            modal.style.display = 'block';

            // Initialize specific config functionality
            initializeConfigModule(configType);
        }

        function getConfigInfo(configType) {
            const configs = {
                'items': {
                    title: 'Item Management',
                    content: `
                        <div class="config-form">
                            <div class="form-actions" style="margin-top: 0; padding-top: 0; border-top: none;">
                                <button class="config-btn primary" onclick="addNewItem()">Add New Item</button>
                                <button class="config-btn secondary" onclick="importItems()">Import Items</button>
                            </div>
                            <table class="data-table" id="itemsTable">
                                <thead>
                                    <tr>
                                        <th>Barcode</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Department</th>
                                        <th>Taxable</th>
                                        <th>EBT</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="itemsTableBody">
                                    <!-- Items will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    `
                },
                'groups': {
                    title: 'Product Groups',
                    content: `
                        <div class="config-form">
                            <div class="form-group">
                                <label>Group Name:</label>
                                <input type="text" id="groupName" placeholder="Enter group name">
                            </div>
                            <div class="form-group">
                                <label>Description:</label>
                                <textarea id="groupDescription" rows="3" placeholder="Group description"></textarea>
                            </div>
                            <div class="form-actions">
                                <button class="config-btn primary" onclick="saveGroup()">Save Group</button>
                                <button class="config-btn secondary" onclick="clearGroupForm()">Clear</button>
                            </div>
                            <table class="data-table" id="groupsTable">
                                <thead>
                                    <tr>
                                        <th>Group Name</th>
                                        <th>Description</th>
                                        <th>Items Count</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="groupsTableBody">
                                    <!-- Groups will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    `
                },
                'tax': {
                    title: 'Tax Configuration',
                    content: `
                        <div class="config-form">
                            <div class="form-group">
                                <label>Tax Name:</label>
                                <input type="text" id="taxName" placeholder="e.g., Sales Tax, VAT">
                            </div>
                            <div class="form-group">
                                <label>Tax Rate (%):</label>
                                <input type="number" id="taxRate" step="0.01" placeholder="8.25">
                            </div>
                            <div class="form-group">
                                <label>Apply to:</label>
                                <select id="taxApplyTo">
                                    <option value="all">All Items</option>
                                    <option value="taxable">Taxable Items Only</option>
                                    <option value="specific">Specific Categories</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="config-btn primary" onclick="saveTaxRate()">Save Tax Rate</button>
                                <button class="config-btn secondary" onclick="clearTaxForm()">Clear</button>
                            </div>
                        </div>
                    `
                },
                'user-accounts': {
                    title: 'User Account Management',
                    content: `
                        <div class="config-form">
                            <div class="form-group">
                                <label>Username:</label>
                                <input type="text" id="newUsername" placeholder="Enter username">
                            </div>
                            <div class="form-group">
                                <label>Full Name:</label>
                                <input type="text" id="newUserFullName" placeholder="Enter full name">
                            </div>
                            <div class="form-group">
                                <label>Password:</label>
                                <input type="password" id="newUserPassword" placeholder="Enter password">
                            </div>
                            <div class="form-group">
                                <label>Role:</label>
                                <select id="newUserRole">
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="config-btn primary" onclick="saveUser()">Create User</button>
                                <button class="config-btn secondary" onclick="clearUserForm()">Clear</button>
                            </div>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableBody">
                                    <!-- Users will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    `
                },
                'store-profile': {
                    title: 'Store Profile',
                    content: `
                        <div class="config-form">
                            <div class="form-group">
                                <label>Store Name:</label>
                                <input type="text" id="storeName" placeholder="Your Store Name">
                            </div>
                            <div class="form-group">
                                <label>Address:</label>
                                <textarea id="storeAddress" rows="3" placeholder="Store address"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Phone:</label>
                                <input type="tel" id="storePhone" placeholder="Store phone number">
                            </div>
                            <div class="form-group">
                                <label>Email:</label>
                                <input type="email" id="storeEmail" placeholder="Store email">
                            </div>
                            <div class="form-group">
                                <label>Tax ID:</label>
                                <input type="text" id="storeTaxId" placeholder="Tax identification number">
                            </div>
                            <div class="form-actions">
                                <button class="config-btn primary" onclick="saveStoreProfile()">Save Profile</button>
                                <button class="config-btn secondary" onclick="loadStoreProfile()">Reload</button>
                            </div>
                        </div>
                    `
                },
                'printer-settings': {
                    title: 'Printer Configuration',
                    content: `
                        <div class="config-form">
                            <div class="form-group">
                                <label>Printer Name:</label>
                                <input type="text" id="printerName" placeholder="Receipt Printer">
                            </div>
                            <div class="form-group">
                                <label>Printer Type:</label>
                                <select id="printerType">
                                    <option value="thermal">Thermal Printer</option>
                                    <option value="inkjet">Inkjet Printer</option>
                                    <option value="laser">Laser Printer</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Paper Width:</label>
                                <select id="paperWidth">
                                    <option value="58mm">58mm</option>
                                    <option value="80mm">80mm</option>
                                    <option value="A4">A4</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button class="config-btn primary" onclick="savePrinterSettings()">Save Settings</button>
                                <button class="config-btn secondary" onclick="testPrint()">Test Print</button>
                            </div>
                        </div>
                    `
                }
            };

            return configs[configType] || {
                title: 'Configuration',
                content: `<div class="config-form"><p>Configuration module for ${configType} is under development.</p></div>`
            };
        }

        function initializeConfigModule(configType) {
            switch(configType) {
                case 'items':
                    loadItemsTable();
                    break;
                case 'groups':
                    loadGroupsTable();
                    break;
                case 'user-accounts':
                    loadUsersTable();
                    break;
                case 'store-profile':
                    loadStoreProfile();
                    break;
                // Add more cases as needed
            }
        }

        // Configuration Module Functions
        function loadItemsTable() {
            const tbody = document.getElementById('itemsTableBody');
            tbody.innerHTML = '';

            // Load from productDatabase
            Object.keys(productDatabase).forEach(barcode => {
                const item = productDatabase[barcode];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${barcode}</td>
                    <td>${item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.department}</td>
                    <td>${item.taxable ? 'Yes' : 'No'}</td>
                    <td>${item.ebtEligible ? 'Yes' : 'No'}</td>
                    <td class="action-buttons">
                        <button class="action-btn edit" onclick="editItem('${barcode}')">Edit</button>
                        <button class="action-btn delete" onclick="deleteItem('${barcode}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadUsersTable() {
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';

            Object.keys(users).forEach(username => {
                const user = users[username];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${username}</td>
                    <td>${user.name}</td>
                    <td>${user.role}</td>
                    <td class="action-buttons">
                        <button class="action-btn edit" onclick="editUser('${username}')">Edit</button>
                        <button class="action-btn delete" onclick="deleteUser('${username}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function addNewItem() {
            alert('Add New Item form - Not implemented yet');
        }

        function saveUser() {
            const username = document.getElementById('newUsername').value.trim();
            const fullName = document.getElementById('newUserFullName').value.trim();
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;

            if (!username || !fullName || !password) {
                alert('Please fill in all required fields');
                return;
            }

            if (users[username]) {
                alert('Username already exists');
                return;
            }

            users[username] = {
                password: password,
                role: role,
                name: fullName,
                permissions: role === 'admin' ? ['all'] : role === 'manager' ? ['sale', 'refund', 'hold_recall', 'discount', 'void', 'reports'] : ['sale', 'refund', 'hold_recall']
            };

            alert('User created successfully');
            clearUserForm();
            loadUsersTable();
        }

        function clearUserForm() {
            document.getElementById('newUsername').value = '';
            document.getElementById('newUserFullName').value = '';
            document.getElementById('newUserPassword').value = '';
            document.getElementById('newUserRole').value = 'cashier';
        }

        function loadStoreProfile() {
            // Load store profile data if exists
            document.getElementById('storeName').value = 'Tsquare POS - Naija Market';
            document.getElementById('storeAddress').value = 'Lagos, Nigeria';
            document.getElementById('storePhone').value = '+234-xxx-xxxx';
            document.getElementById('storeEmail').value = 'store@tsquarepos.com';
            document.getElementById('storeTaxId').value = 'TAX-12345';
        }

        function saveStoreProfile() {
            const profile = {
                name: document.getElementById('storeName').value,
                address: document.getElementById('storeAddress').value,
                phone: document.getElementById('storePhone').value,
                email: document.getElementById('storeEmail').value,
                taxId: document.getElementById('storeTaxId').value
            };

            // Save to local storage or backend
            localStorage.setItem('storeProfile', JSON.stringify(profile));
            alert('Store profile saved successfully');
        }

        function closeConfigModal() {
            document.getElementById('configModal').style.display = 'none';
        }

        function updateDateTime() {
            const now = new Date();
            document.getElementById('currentDate').textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        }

        function addItemByBarcode() {
            const barcode = document.getElementById('barcodeInput').value.trim();
            if (!barcode) return;

            const product = productDatabase[barcode];
            if (product) {
                addItemToSale(product);
                document.getElementById('barcodeInput').value = '';
                document.getElementById('barcodeInput').focus();
            } else {
                alert('Product not found: ' + barcode);
            }
        }

        function addItemToSale(product, quantity = 1) {
            const item = {
                id: Date.now(),
                name: product.name,
                price: product.price,
                quantity: quantity,
                taxable: product.taxable,
                ebtEligible: product.ebtEligible,
                total: product.price * quantity
            };

            currentSale.items.push(item);
            updateSaleDisplay();
            updateStatusBar('Item added: ' + product.name);
        }

        function updateSaleDisplay() {
            const saleList = document.getElementById('saleList');
            
            // Keep header and clear items
            saleList.innerHTML = `
                <div class="sale-item" style="background: #34495e; color: white; font-weight: bold;">
                    <div>DESCRIPTION</div>
                    <div>QTY</div>
                    <div>PRICE</div>
                    <div>TAX</div>
                </div>
            `;

            currentSale.items.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'sale-item';
                itemDiv.innerHTML = `
                    <div>${item.name}</div>
                    <div><input type="number" class="quantity-input" value="${item.quantity}" 
                         onchange="updateItemQuantity(${index}, this.value)" min="1"></div>
                    <div>$${item.total.toFixed(2)}</div>
                    <div>${item.taxable ? 'T' : ''}</div>
                `;
                itemDiv.onclick = () => selectItem(index);
                saleList.appendChild(itemDiv);
            });

            calculateTotals();
        }

        function updateItemQuantity(index, newQuantity) {
            const qty = parseInt(newQuantity) || 1;
            currentSale.items[index].quantity = qty;
            currentSale.items[index].total = currentSale.items[index].price * qty;
            updateSaleDisplay();
        }

        function calculateTotals() {
            currentSale.subtotal = currentSale.items.reduce((sum, item) => sum + item.total, 0);
            currentSale.tax = currentSale.items
                .filter(item => item.taxable)
                .reduce((sum, item) => sum + (item.total * 0.08), 0); // 8% tax rate
            currentSale.total = currentSale.subtotal + currentSale.tax - currentSale.discount;

            document.getElementById('subtotal').textContent = '$' + currentSale.subtotal.toFixed(2);
            document.getElementById('discount').textContent = '$' + currentSale.discount.toFixed(2);
            document.getElementById('tax').textContent = '$' + currentSale.tax.toFixed(2);
            document.getElementById('total').textContent = '$' + currentSale.total.toFixed(2);
        }

        // Department button handlers
        document.querySelectorAll('.dept-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dept = this.dataset.dept;
                
                if (dept === 'OPTIONS') {
                    openAdminPanel();
                } else if (departmentItems[dept]) {
                    showDepartmentItems(dept);
                } else {
                    updateStatusBar('Department: ' + dept + ' - Not implemented yet');
                }
            });
        });

        function showDepartmentItems(department) {
            const items = departmentItems[department];
            const itemList = document.getElementById('itemList');
            
            itemList.innerHTML = '<h4>' + department + ' ITEMS</h4>';
            
            items.forEach(item => {
                const itemBtn = document.createElement('button');
                itemBtn.className = 'dept-btn';
                itemBtn.style.width = '100%';
                itemBtn.style.margin = '5px 0';
                itemBtn.textContent = `${item.name} - $${item.price.toFixed(2)}`;
                itemBtn.onclick = () => {
                    addItemToSale(item);
                    closeModal();
                };
                itemList.appendChild(itemBtn);
            });

            document.getElementById('itemModal').style.display = 'block';
        }

        function processPayment(type) {
            if (currentSale.items.length === 0) {
                alert('No items in sale');
                return;
            }

            document.getElementById('paymentType').textContent = type;
            document.getElementById('amountDue').textContent = '$' + currentSale.total.toFixed(2);
            document.getElementById('amountReceived').value = currentSale.total.toFixed(2);
            document.getElementById('paymentModal').style.display = 'block';
        }

        function completePayment() {
            const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
            const paymentType = document.getElementById('paymentType').textContent;
            
            if (amountReceived < currentSale.total) {
                alert('Insufficient payment amount');
                return;
            }

            const change = amountReceived - currentSale.total;
            
            // Store transaction
            lastTransaction = {
                items: [...currentSale.items],
                subtotal: currentSale.subtotal,
                tax: currentSale.tax,
                total: currentSale.total,
                paymentType: paymentType,
                amountReceived: amountReceived,
                change: change,
                timestamp: new Date()
            };

            if (change > 0) {
                alert(`Payment complete. Change due: $${change.toFixed(2)}`);
            } else {
                alert('Payment complete. Thank you!');
            }

            // Clear sale
            currentSale = { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 };
            updateSaleDisplay();
            closeModal();
            updateStatusBar('Transaction completed');
            
            // Print receipt (simulated)
            printReceipt(lastTransaction);
        }

        function printReceipt(transaction) {
            console.log('=== RECEIPT ===');
            console.log('Date:', transaction.timestamp.toLocaleString());
            console.log('Items:');
            transaction.items.forEach(item => {
                console.log(`${item.name} x${item.quantity} - $${item.total.toFixed(2)}`);
            });
            console.log('Subtotal:', '$' + transaction.subtotal.toFixed(2));
            console.log('Tax:', '$' + transaction.tax.toFixed(2));
            console.log('Total:', '$' + transaction.total.toFixed(2));
            console.log('Payment:', transaction.paymentType);
            console.log('Amount Received:', '$' + transaction.amountReceived.toFixed(2));
            console.log('Change:', '$' + transaction.change.toFixed(2));
            console.log('===============');
        }

        function cancelOrder() {
            if (currentSale.items.length === 0) {
                alert('No active sale to cancel');
                return;
            }
            
            if (confirm('Cancel current order? This cannot be undone.')) {
                currentSale = { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 };
                updateSaleDisplay();
                updateStatusBar('Order cancelled');
            }
        }

        function holdOrder() {
            if (currentSale.items.length === 0) {
                alert('No items to hold');
                return;
            }
            
            heldOrders.push({
                id: Date.now(),
                sale: { ...currentSale, items: [...currentSale.items] },
                timestamp: new Date()
            });
            
            currentSale = { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 };
            updateSaleDisplay();
            updateStatusBar('Order held');
        }

        function recallOrder() {
            if (heldOrders.length === 0) {
                alert('No held orders');
                return;
            }
            
            const orderList = heldOrders.map((order, index) => 
                `${index + 1}: ${order.timestamp.toLocaleTimeString()} - $${order.sale.total.toFixed(2)}`
            ).join('\n');
            
            const selection = prompt('Select order to recall:\n' + orderList);
            const orderIndex = parseInt(selection) - 1;
            
            if (orderIndex >= 0 && orderIndex < heldOrders.length) {
                currentSale = heldOrders[orderIndex].sale;
                heldOrders.splice(orderIndex, 1);
                updateSaleDisplay();
                updateStatusBar('Order recalled');
            }
        }

        function voidLastItem() {
            if (currentSale.items.length === 0) {
                alert('No items to void');
                return;
            }
            
            const lastItem = currentSale.items.pop();
            updateSaleDisplay();
            updateStatusBar('Voided: ' + lastItem.name);
        }

        function applyDiscount() {
            const discountAmount = prompt('Enter discount amount ($):');
            if (discountAmount && !isNaN(discountAmount)) {
                currentSale.discount = parseFloat(discountAmount);
                calculateTotals();
                updateStatusBar('Discount applied: $' + discountAmount);
            }
        }

        function refundItem() {
            updateStatusBar('Refund function - Not implemented yet');
        }

        function reprintReceipt() {
            if (lastTransaction) {
                printReceipt(lastTransaction);
                updateStatusBar('Receipt reprinted');
            } else {
                alert('No previous transaction to reprint');
            }
        }

        function changeOrder() {
            updateStatusBar('Change order function - Not implemented yet');
        }

        function openAdminPanel() {
            if (!hasPermission('all')) {
                alert('Access denied: Admin privileges required');
                return;
            }
            updateStatusBar('Admin panel - Not implemented yet');
        }

        function closeModal() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }

        function updateStatusBar(message) {
            document.getElementById('systemStatus').textContent = message;
            setTimeout(() => {
                document.getElementById('systemStatus').textContent = 'READY';
            }, 3000);
        }

        // Click outside modal to close
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                closeModal();
            }
        }
    