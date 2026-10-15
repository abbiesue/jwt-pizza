import { basicInit } from './mocks';
import { test, expect } from './testSetup';

//login/register tests:
test('login', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('register', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(
        page.getByRole('heading', { name: 'Welcome to the party' })
    ).toBeVisible();

    await page.getByPlaceholder('Full name').fill('Pizza Diner');
    await page.getByPlaceholder('Email address').fill('new@jwt.com');
    await page.getByPlaceholder('Password').fill('secret');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('link', { name: 'PD' })).toBeVisible();
    await expect(
        page.getByRole('link', { name: 'Register' })
    ).not.toBeVisible();
});

test('logout', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'KC' })).not.toBeVisible();
});

test('login with invalid credentials', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Unauthorized')).toBeVisible();
    await expect(
        page
            .getByRole('navigation', { name: 'Global' })
            .getByRole('link', { name: 'Login' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'KC' })).not.toBeVisible();
});

// purchase test:
test('purchase with login', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('button', { name: 'Order now' }).click();

    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page
        .getByRole('link', { name: 'Image Description Veggie A' })
        .click();
    await page
        .getByRole('link', { name: 'Image Description Pepperoni' })
        .click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('main')).toContainText(
        'Send me those 2 pizzas right now!'
    );
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();

    await expect(page.getByText('0.008')).toBeVisible();
});

// diner dashboard test:
test('diner dashboard', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'KC' }).click();

    await expect(
        page.getByRole('heading', { name: 'Your pizza kitchen' })
    ).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Kai Chen');
    await expect(page.getByRole('main')).toContainText('d@jwt.com');
    await expect(page.getByRole('main')).toContainText('diner');

    await expect(page.getByRole('table')).toContainText('23');
    await expect(page.getByRole('table')).toContainText('0.008 ₿');
});

//franchise tests
test('franchise logged out', async ({ page }) => {
    await basicInit(page);
    await page
        .getByRole('navigation', { name: 'Global' })
        .getByRole('link', { name: 'Franchise' })
        .click();

    await expect(
        page.getByText('So you want a piece of the pie?')
    ).toBeVisible();
});

test('franchise dashboard', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('b');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'FO' })).toBeVisible();
    await page
        .getByRole('navigation', { name: 'Global' })
        .getByRole('link', { name: 'Franchise' })
        .click();

    await expect(
        page.getByText(
            'Everything you need to run an JWT Pizza franchise. Your gateway to success.'
        )
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'LotaPizza' })
    ).toBeVisible();
    await expect(page.getByRole('table')).toContainText('Lehi');
    await expect(page.getByRole('table')).toContainText('1,000 ₿');
});

test('franchisee create store', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('b');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'FO' })).toBeVisible();
    await page
        .getByRole('navigation', { name: 'Global' })
        .getByRole('link', { name: 'Franchise' })
        .click();
    await expect(
        page.getByRole('heading', { name: 'LotaPizza' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(
        page.getByRole('heading', { name: 'Create store' })
    ).toBeVisible();
    await page.getByPlaceholder('store name').fill('Provo');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
        page.getByRole('heading', { name: 'LotaPizza' })
    ).toBeVisible();
});

//admin tests
test('admin dashboard', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('c');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'DA' })).toBeVisible();
    await page
        .getByRole('navigation', { name: 'Global' })
        .getByRole('link', { name: 'Admin' })
        .click();

    await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Franchises' })
    ).toBeVisible();
    await expect(page.getByRole('table', { name: 'Franchises' })).toContainText(
        'LotaPizza'
    );
    await expect(page.getByRole('table', { name: 'Franchises' })).toContainText(
        'Lehi'
    );
});

//admin create franchise test
test('admin create franchise', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('c');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'DA' })).toBeVisible();
    await page
        .getByRole('navigation', { name: 'Global' })
        .getByRole('link', { name: 'Admin' })
        .click();
    await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();

    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByPlaceholder('franchise name').fill('Pizza Palace');
    await page.getByPlaceholder('franchisee admin email').fill('owner@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
        page.getByRole('heading', { name: 'Franchises' })
    ).toBeVisible();
    await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
});
