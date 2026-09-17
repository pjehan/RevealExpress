import { expect, test, type Browser, type Page } from '@playwright/test';

const PASSWORD = 'secret';
const QUIZ_SLIDE = 3;

async function openSlideshow(page: Page, slide = 0) {
  await page.goto(`/#/${slide}`);
  await expect(page.locator('.reveal.ready')).toBeVisible();
}

async function openToolbar(page: Page) {
  const toggle = page.locator('.btn-show-tools');
  if ((await toggle.getAttribute('aria-expanded')) === 'false') {
    await toggle.click();
  }
}

async function becomePresenter(page: Page) {
  await openToolbar(page);
  await page.getByLabel('Mode').selectOption('presenter');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByLabel('Mode')).toHaveValue('presenter');
}

/** Pages in separate browser contexts, like different people in the audience */
async function newPage(browser: Browser) {
  const context = await browser.newContext();
  return context.newPage();
}

test('loads chapters in alphabetical order and runs presentation scripts', async ({ page }) => {
  await openSlideshow(page);
  await expect(page).toHaveTitle('E2E slideshow');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
  // Set by the presentation script when the "loaded" event is dispatched
  await expect(page.locator('body')).toHaveAttribute('data-total-slides', '4');
});

test('asks the presenter password in a masked field', async ({ page }) => {
  await openSlideshow(page);
  await openToolbar(page);
  await page.getByLabel('Mode').selectOption('presenter');

  const password = page.getByLabel('Password');
  await expect(password).toHaveAttribute('type', 'password');
  await expect(password).toBeFocused();

  await password.fill('wrong');
  await password.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Wrong password');

  // Escape cancels without opening reveal.js overview
  await password.press('Escape');
  await expect(password).toBeHidden();
  await expect(page.getByLabel('Mode')).toHaveValue('spectator');
  await expect(page.locator('.reveal')).not.toHaveClass(/overview/);

  await becomePresenter(page);
});

test('remembers presenter mode after reloading the page', async ({ page }) => {
  await openSlideshow(page);
  await becomePresenter(page);

  await page.reload();
  await expect(page.locator('.reveal.ready')).toBeVisible();
  await expect(page.getByLabel('Mode')).toHaveValue('presenter');
});

test('spectators follow the presenter immediately', async ({ browser }) => {
  const presenter = await newPage(browser);
  const spectator = await newPage(browser);

  await openSlideshow(presenter);
  await becomePresenter(presenter);
  await presenter.getByRole('button', { name: 'Hide tools' }).click();
  await presenter.keyboard.press('ArrowRight');
  await expect(presenter).toHaveURL(/#\/1$/);

  await openSlideshow(spectator);
  await openToolbar(spectator);
  // Click the visual switch, which covers the checkbox
  await spectator.locator('label.switch').click();
  await expect(spectator.getByLabel('Auto slide')).toBeChecked();
  await expect(spectator).toHaveURL(/#\/1$/);

  await presenter.keyboard.press('ArrowRight');
  await expect(spectator).toHaveURL(/#\/2$/);
});

test('counts quiz answers for the presenter', async ({ browser }) => {
  const presenter = await newPage(browser);
  const spectator = await newPage(browser);

  await openSlideshow(presenter, QUIZ_SLIDE);
  await becomePresenter(presenter);
  await expect(presenter.locator('label[for="input-blink"] .counter')).toHaveText('0');

  await openSlideshow(spectator, QUIZ_SLIDE);
  await spectator.locator('label[for="input-blink"]').click();
  await spectator.getByRole('button', { name: 'Submit' }).click();
  await expect(spectator.locator('#input-blink')).toBeDisabled();

  await expect(presenter.locator('label[for="input-blink"] .counter')).toHaveText('1');
  await expect(presenter.locator('label[for="input-gecko"] .counter')).toHaveText('0');
});

test('toolbar can be used with the keyboard', async ({ page }) => {
  await openSlideshow(page);

  // Hidden tools are skipped: the first focusable element is the toolbar button
  await page.keyboard.press('Tab');
  const toggle = page.getByRole('button', { name: 'Show tools' });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Hide tools' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );

  await page.getByLabel('Mode').focus();
  await page.keyboard.press('Tab');
  const follow = page.getByLabel('Auto slide');
  await expect(follow).toBeFocused();
  await page.keyboard.press('Space');
  await expect(follow).toBeChecked();
});
