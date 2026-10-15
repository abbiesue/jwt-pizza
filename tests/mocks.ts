import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';
import { expect } from './testSetup';

export async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = {
        'd@jwt.com': {
            id: '3',
            name: 'Kai Chen',
            email: 'd@jwt.com',
            password: 'a',
            roles: [{ role: Role.Diner }]
        },
        'f@jwt.com': {
            id: '4',
            name: 'Francis Owens',
            email: 'f@jwt.com',
            password: 'b',
            roles: [{ role: Role.Franchisee, objectId: '2' }]
        },
        'a@jwt.com': {
            id: '5',
            name: 'Dash Adams',
            email: 'a@jwt.com',
            password: 'c',
            roles: [{ role: Role.Admin }]
        }
    };

    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();

        // Register
        if (method === 'POST') {
            const registerReq = route.request().postDataJSON();
            const newUser: User = {
                id: '4',
                name: registerReq.name,
                email: registerReq.email,
                password: registerReq.password,
                roles: [{ role: Role.Diner }]
            };
            validUsers[newUser.email!] = newUser;
            loggedInUser = newUser;
            const registerRes = { user: loggedInUser, token: 'abcdef' };
            await route.fulfill({ json: registerRes });
            return;
        }

        // Logout
        if (method === 'DELETE') {
            loggedInUser = undefined;
            await route.fulfill({ status: 204 });
            return;
        }

        // Login
        expect(method).toBe('PUT');
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({
                status: 401,
                json: { message: 'Unauthorized' }
            });
            return;
        }
        loggedInUser = validUsers[loginReq.email];
        const loginRes = {
            user: loggedInUser,
            token: 'abcdef'
        };
        await route.fulfill({ json: loginRes });
    });

    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: loggedInUser });
    });

    await page.route('*/**/api/order/menu', async (route) => {
        const menuRes = [
            {
                id: 1,
                title: 'Veggie',
                image: 'pizza1.png',
                price: 0.0038,
                description: 'A garden of delight'
            },
            {
                id: 2,
                title: 'Pepperoni',
                image: 'pizza2.png',
                price: 0.0042,
                description: 'Spicy treat'
            }
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: menuRes });
    });

    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
        if (route.request().method() === 'POST') {
            const createFranchiseReq = route.request().postDataJSON();
            expect(createFranchiseReq).toMatchObject({
                name: 'Pizza Palace',
                admins: [{ email: 'owner@jwt.com' }]
            });
            const newFranchise = {
                id: 5,
                name: createFranchiseReq.name,
                admins: createFranchiseReq.admins,
                stores: []
            };
            await route.fulfill({ json: newFranchise });
            return;
        }

        const franchiseRes = {
            franchises: [
                {
                    id: 2,
                    name: 'LotaPizza',
                    stores: [
                        { id: 4, name: 'Lehi' },
                        { id: 5, name: 'Springville' },
                        { id: 6, name: 'American Fork' }
                    ]
                },
                {
                    id: 3,
                    name: 'PizzaCorp',
                    stores: [{ id: 7, name: 'Spanish Fork' }]
                },
                { id: 4, name: 'topSpot', stores: [] }
            ]
        };
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
    });

    await page.route(/\/api\/franchise\/\d+$/, async (route) => {
        expect(route.request().method()).toBe('GET');
        const userFranchisesRes = [
            {
                id: '2',
                name: 'LotaPizza',
                admins: [
                    { id: '4', name: 'Francis Owens', email: 'f@jwt.com' }
                ],
                stores: [
                    { id: '4', name: 'Lehi', totalRevenue: 1000 },
                    { id: '5', name: 'Springville', totalRevenue: 250 }
                ]
            }
        ];
        await route.fulfill({ json: userFranchisesRes });
    });

    await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
        expect(route.request().method()).toBe('POST');
        const createStoreReq = route.request().postDataJSON();
        expect(createStoreReq).toMatchObject({ name: 'Provo' });
        const newStore = {
            id: '8',
            name: createStoreReq.name,
            totalRevenue: 0
        };
        await route.fulfill({ json: newStore });
    });

    await page.route('*/**/api/order', async (route) => {
        //Display order history
        if (route.request().method() === 'GET') {
            const orderHistoryRes = {
                id: '1',
                dinerId: loggedInUser?.id,
                orders: [
                    {
                        id: '23',
                        franchiseId: '2',
                        storeId: '4',
                        date: '2026-10-07T12:00:00.000Z',
                        items: [
                            {
                                menuId: '1',
                                description: 'Veggie',
                                price: 0.0038
                            },
                            {
                                menuId: '2',
                                description: 'Pepperoni',
                                price: 0.0042
                            }
                        ]
                    }
                ]
            };
            await route.fulfill({ json: orderHistoryRes });
            return;
        }

        //Place an order
        expect(route.request().method()).toBe('POST');
        const orderReq = route.request().postDataJSON();
        const orderRes = {
            order: { ...orderReq, id: 23 },
            jwt: 'eyJpYXQ'
        };
        await route.fulfill({ json: orderRes });
    });

    await page.goto('/');
}
