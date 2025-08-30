// DailyMood AI - Button Audit Script
// Phase 1.1: Identify all non-functional buttons
// Run this in browser console to find broken interactions

console.log('🔍 Starting DailyMood AI Button Audit...');

const buttons = document.querySelectorAll('button, a[href="#"], [onClick], [data-testid*="button"], .btn, .button');
const nonFunctional = [];
const potentialIssues = [];

buttons.forEach((btn, index) => {
  const buttonInfo = {
    index: index + 1,
    text: btn.innerText.trim() || btn.getAttribute('aria-label') || 'No text',
    tag: btn.tagName,
    className: btn.className,
    id: btn.id,
    location: btn.closest('[data-page]')?.dataset.page || 
              btn.closest('section')?.className || 
              btn.closest('div[class*="page"]')?.className ||
              'unknown',
    element: btn,
    hasOnClick: !!btn.onclick,
    hasEventListener: btn.getEventListeners ? Object.keys(btn.getEventListeners()).length > 0 : 'unknown',
    href: btn.href,
    type: btn.type,
    disabled: btn.disabled
  };

  // Check for non-functional buttons
  const isNonFunctional = (
    !btn.onclick && 
    !btn.href && 
    !btn.hasAttribute('type') &&
    btn.tagName !== 'INPUT' &&
    !btn.closest('form') &&
    !buttonInfo.hasEventListener
  );

  if (isNonFunctional) {
    nonFunctional.push(buttonInfo);
  }

  // Check for potential issues
  if (btn.href === '#' || btn.href === 'javascript:void(0)') {
    potentialIssues.push({
      ...buttonInfo,
      issue: 'Dead link (href="#" or javascript:void(0))'
    });
  }

  if (btn.disabled && !btn.hasAttribute('data-reason')) {
    potentialIssues.push({
      ...buttonInfo,
      issue: 'Disabled without explanation'
    });
  }

  if (!btn.innerText.trim() && !btn.getAttribute('aria-label')) {
    potentialIssues.push({
      ...buttonInfo,
      issue: 'No text or aria-label'
    });
  }
});

console.log('\n🚨 NON-FUNCTIONAL BUTTONS FOUND:', nonFunctional.length);
if (nonFunctional.length > 0) {
  console.table(nonFunctional.map(btn => ({
    'Button Text': btn.text,
    'Location': btn.location,
    'Tag': btn.tag,
    'Class': btn.className.substring(0, 30) + '...',
    'Has onClick': btn.hasOnClick,
    'Has Href': !!btn.href,
    'Type': btn.type || 'none'
  })));
}

console.log('\n⚠️  POTENTIAL ISSUES FOUND:', potentialIssues.length);
if (potentialIssues.length > 0) {
  console.table(potentialIssues.map(btn => ({
    'Button Text': btn.text,
    'Issue': btn.issue,
    'Location': btn.location,
    'Tag': btn.tag
  })));
}

// Page-specific checks
console.log('\n📊 BUTTON ANALYSIS BY PAGE/SECTION:');
const locationStats = {};
buttons.forEach(btn => {
  const location = btn.closest('[data-page]')?.dataset.page || 
                  btn.closest('section')?.className || 
                  'unknown';
  locationStats[location] = (locationStats[location] || 0) + 1;
});

console.table(locationStats);

// Interactive debugging helpers
console.log('\n🛠️  DEBUGGING HELPERS:');
console.log('To inspect a specific button: buttons[INDEX].element');
console.log('To highlight all non-functional buttons:');
console.log(`
nonFunctionalButtons = ${JSON.stringify(nonFunctional.map((_, i) => i))};
nonFunctionalButtons.forEach(i => {
  buttons[nonFunctional[i].index - 1].style.outline = '3px solid red';
  buttons[nonFunctional[i].index - 1].style.backgroundColor = 'rgba(255,0,0,0.1)';
});
`);

// Generate fix suggestions
console.log('\n🔧 FIX SUGGESTIONS:');
nonFunctional.forEach((btn, i) => {
  console.log(`${i + 1}. "${btn.text}" in ${btn.location}:`);
  
  if (btn.text.toLowerCase().includes('save') || btn.text.toLowerCase().includes('submit')) {
    console.log('   → Add onClick handler for form submission');
  } else if (btn.text.toLowerCase().includes('login') || btn.text.toLowerCase().includes('signup')) {
    console.log('   → Add navigation or form submission handler');
  } else if (btn.text.toLowerCase().includes('logout')) {
    console.log('   → Add logout functionality with supabase.auth.signOut()');
  } else if (btn.className.includes('nav') || btn.text.toLowerCase().includes('dashboard')) {
    console.log('   → Convert to Link component or add router.push()');
  } else {
    console.log('   → Determine intended function and add appropriate handler');
  }
});

// Export data for development use
window.buttonAuditResults = {
  nonFunctional,
  potentialIssues,
  allButtons: Array.from(buttons).map((btn, i) => ({
    index: i,
    text: btn.innerText.trim(),
    element: btn
  })),
  stats: {
    total: buttons.length,
    nonFunctional: nonFunctional.length,
    issues: potentialIssues.length,
    functionalPercentage: Math.round((1 - nonFunctional.length / buttons.length) * 100)
  }
};

console.log(`\n✅ Audit Complete! ${window.buttonAuditResults.stats.functionalPercentage}% of buttons appear functional`);
console.log('Results stored in: window.buttonAuditResults');

if (nonFunctional.length > 0) {
  console.log(`\n🎯 PRIORITY: Fix ${nonFunctional.length} non-functional buttons to proceed to Phase 1.2`);
} else {
  console.log('\n🎉 All buttons appear to have functionality! Ready for Phase 1.2');
}

