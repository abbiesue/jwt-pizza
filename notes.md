# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.tsx | none | none |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx | [POST] /api/auth | `INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/>`INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)` |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx | [PUT] /api/auth | `SELECT * FROM user WHERE email=?` <br/> `SELECT * FROM userRole WHERE userId=?` <br /> `INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token` |
| Order pizza                                         | menu.tsx <br/> payment.tsx | [GET] /api/order/menu <br/> [GET] /api/franchise?page=0&limit=20&name=* <br/> [GET] /api/user/me <br/> [POST] /api/order | `INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())` <br/> `SELECT id FROM menu WHERE id=?` <br/> `INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)` |
| Verify pizza                                        | delivery.tsx | makes call to Factory endpoint, not ours | none |
| View profile page                                   | dinerDashboard.tsx | [GET] /api/order | `SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT ${offset},${config.db.listPerPage}` <br/> `SELECT id, menuId, description, price FROM orderItem WHERE orderId=?` |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx | [GET] /api/franchise/:userId | `SELECT id, name FROM franchise WHERE name LIKE ? LIMIT ${limit + 1} OFFSET ${offset}` <br/> this will return nothing and the entire page will default to whyFranchise() |
| Logout                                              | logout.tsx | [DELETE] api/auth | `DELETE FROM auth WHERE token=?` |
| View About page                                     | about.tsx |                   |              |
| View History page                                   | history.tsx |                   |              |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx |                   |              |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx |                   |              |
| Create a store                                      | createStore.tsx |                   |              |
| Close a store                                       | closeStore.tsx |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx |                   |              |
| View Admin page                                     | adminDashboard.tsx |                   |              |
| Create a franchise for t@jwt.com                    | createFranchise.tsx |                   |              |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx |                   |              |
