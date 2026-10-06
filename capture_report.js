const { chromium } = require('./Campus-Connect-Frontend/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'report_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Also save directly to brain artifact directory so they can be embedded in markdown report
const ARTIFACT_DIR = "C:\\Users\\Kushal Patel\\.gemini\\antigravity-ide\\brain\\4c447214-2b69-46cb-be46-bd7ffd06fbf8";

async function saveScreenshot(page, filename, description) {
  const filePath1 = path.join(SCREENSHOT_DIR, filename);
  const filePath2 = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: filePath1, fullPage: true });
  fs.copyFileSync(filePath1, filePath2);
  console.log(`[Captured] ${filename} - ${description}`);
}

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Launching browser with:', executablePath);
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--window-size=1280,800']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // 1. Visit Login Page
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '01_login_student_tab.png', 'Login Page (Default Student View)');

    // 2. Click CR Role Tab
    console.log('Selecting CR Role Tab...');
    const crButton = page.locator('button.role-tab-btn:has-text("CR")');
    await crButton.click();
    await page.waitForTimeout(500);
    await saveScreenshot(page, '02_login_cr_tab.png', 'Login Page (CR Role Selected)');

    // 3. Fill in CR Login details for Kushal Patel
    console.log('Filling Kushal Patel CR details...');
    await page.locator('input[type="text"]').first().fill('Kushal Patel');
    await page.locator('input[type="text"]').nth(1).fill('IT2024002');
    await saveScreenshot(page, '03_login_cr_filled.png', 'CR Credentials Filled for Kushal Patel');

    // 4. Submit Login Form
    console.log('Logging in...');
    await page.locator('button[type="submit"]:has-text("Login")').click();
    await page.waitForSelector('.main-content', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 5. Dashboard Tab
    await saveScreenshot(page, '04_dashboard_cr.png', 'CR Dashboard - Profile & Verification Details');

    // 6. Academics Tab
    console.log('Navigating to Academics...');
    await page.locator('.nav-item:has-text("Academics")').click();
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '05_academics.png', 'Academics - Pending Assignments & Deadlines');

    // 7. Social Hub Tab (and post a test CR message)
    console.log('Navigating to Social Hub...');
    await page.locator('.nav-item:has-text("Social Hub")').click();
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '06_social_hub_before.png', 'Social Hub - Department Discussion Board');

    console.log('Posting announcement message in Social Hub...');
    const msgInput = page.locator('form input[name="message"]');
    if (await msgInput.count() > 0) {
      await msgInput.fill('📢 Notice from CR (Kushal Patel): Please submit Assignment 1 by Friday and check upcoming events!');
      await page.locator('form button:has-text("Send")').click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, '07_social_hub_posted.png', 'Social Hub - Real-time Discussion with CR Announcement');
    }

    // 8. Events Tab (CR has schedule permission)
    console.log('Navigating to Events...');
    await page.locator('.nav-item:has-text("Events")').click();
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '08_events_list.png', 'Events - Campus Events & CR Event Creation Form');

    console.log('Scheduling event as CR...');
    const eventTitle = page.locator('input[name="title"]');
    const eventDate = page.locator('input[name="date"]');
    if (await eventTitle.count() > 0) {
      await eventTitle.fill('Annual IT Tech Symposium 2026');
      await eventDate.fill('2026-11-20');
      await page.locator('button:has-text("Add Event")').click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, '09_events_scheduled.png', 'Events - Newly Created Event by CR');
    }

    // 9. Resources Tab
    console.log('Navigating to Resources...');
    await page.locator('.nav-item:has-text("Resources")').click();
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '10_resources.png', 'Resources - Course Materials & Upload Portal');

    // 10. Also capture Professor portal for report completeness if possible
    console.log('Capturing Professor view for comprehensive report...');
    await page.locator('.logout-btn').click();
    await page.waitForTimeout(1000);

    const profButton = page.locator('button.role-tab-btn:has-text("Professor")');
    await profButton.click();
    await page.waitForTimeout(500);
    await saveScreenshot(page, '11_login_professor_tab.png', 'Professor Login Screen');

    await page.locator('input[name="email"], input[type="email"]').fill('alan.smith@campus.edu');
    await page.locator('input[name="password"], input[type="password"]').fill('Faculty@123');
    await page.locator('button[type="submit"]:has-text("Login")').click();
    await page.waitForTimeout(1500);

    const studentMgmtNav = page.locator('.nav-item:has-text("Student Management")');
    if (await studentMgmtNav.count() > 0) {
      await studentMgmtNav.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, '12_professor_student_management.png', 'Professor Portal - Student Management & CR Promotion/Demotion');
    }

    console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
})();
