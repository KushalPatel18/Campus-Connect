const { chromium } = require('./Campus-Connect-Frontend/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = "C:\\Users\\Kushal Patel\\.gemini\\antigravity-ide\\brain\\4c447214-2b69-46cb-be46-bd7ffd06fbf8";
const REPORT_DIR = "c:\\Users\\Kushal Patel\\OneDrive\\Desktop\\Campus-Connect\\report_screenshots";

async function save(page, name) {
  const p1 = path.join(REPORT_DIR, name);
  const p2 = path.join(ARTIFACT_DIR, name);
  await page.screenshot({ path: p1, fullPage: true });
  fs.copyFileSync(p1, p2);
  console.log('Saved:', name);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--window-size=1280,800']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // 1. Log in as Professor
  await page.goto('http://localhost:5173');
  await page.locator('button.role-tab-btn:has-text("Professor")').click();
  await page.locator('input[name="email"], input[type="email"]').fill('prof.smith@campus.edu');
  await page.locator('input[name="password"], input[type="password"]').fill('Faculty@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('.main-content');
  await page.waitForTimeout(1000);

  // Student Management
  await page.locator('.nav-item:has-text("Student Management")').click();
  await page.waitForTimeout(1000);
  await save(page, '12_professor_student_management.png');

  // Academics - Post Assignment
  await page.locator('.nav-item:has-text("Academics")').click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="title"]').fill('Database Systems Project - Phase 1');
  await page.locator('input[name="dueDate"]').fill('2026-10-30');
  await page.locator('button:has-text("Post Assignment")').click();
  await page.waitForTimeout(1000);
  await save(page, '13_professor_academics_posted.png');

  // Logout
  await page.locator('.logout-btn').click();
  await page.waitForTimeout(1000);

  // 2. Re-login as Kushal Patel (CR) to capture updated Academics view
  await page.locator('button.role-tab-btn:has-text("CR")').click();
  await page.locator('input[type="text"]').first().fill('Kushal Patel');
  await page.locator('input[type="text"]').nth(1).fill('IT2024002');
  await page.locator('button[type="submit"]:has-text("Login")').click();
  await page.waitForSelector('.main-content');
  await page.waitForTimeout(1000);

  await page.locator('.nav-item:has-text("Academics")').click();
  await page.waitForTimeout(1000);
  await save(page, '05_academics.png');

  await browser.close();
  console.log('Finished capturing supplemental screens!');
})();
