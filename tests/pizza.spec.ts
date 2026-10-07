import { test, expect } from 'playwright-test-coverage';
import type { Page } from '@playwright/test';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: { role: string }[];
};

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      password: 'diner',
      roles: [{ role: 'diner' }],
    },
  };

  // Login: PUT /api/auth
    await page.route('*/**/api/auth', async (route) => {
        expect(route.request().method()).toBe('PUT');
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
            return;
        }
        loggedInUser = user;
        const loginRes = { user, token: 'abcdef' };
        await route.fulfill({ json: loginRes });
    });

  // Current user: GET /api/user/me
    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        const userRes = loggedInUser;
        await route.fulfill({ json: userRes });
    });

  // Menu: GET /api/order/menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Franchises and stores: GET /api/franchise (regex, because the URL can have ?page=...&limit=... on the end)
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 1, name: 'Lehi' }, // id 1 matches selectOption('1') in the test
            { id: 5, name: 'Springville' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      ],
      more: false,
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Place an order: POST /api/order
  await page.route('*/**/api/order', async (route) => {
    expect(route.request().method()).toBe('POST');
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('home page', async ({ page }) => {
  await basicInit(page);

  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('button', { name: 'Order now' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('main')).toContainText('0.008 ₿');
});