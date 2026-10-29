/**
 * Fictional aggregate cohorts for the Friction Radar product demo.
 * All rates are percentages (0–100), rounded to one decimal place.
 * A milestone's entered users completed the preceding milestone; completed
 * users finished this milestone. Last-step completion is the journey outcome.
 * Support counts are linked conversations, not unique customers. Repeat and
 * error users can overlap. Dashboard-level counts are deduplicated sample
 * totals; they must not be summed from milestone counts.
 */

export const SEGMENTS = ['Startup', 'Growth', 'Enterprise'];
export const PERIODS = [
  { value: 7, label: 'Last 7 days', range: 'Oct 22–28, 2026' },
  { value: 30, label: 'Last 30 days', range: 'Sep 29–Oct 28, 2026' },
  { value: 90, label: 'Last 90 days', range: 'Jul 31–Oct 28, 2026' },
];

const channels = ['Support chat', 'Support ticket', 'Customer interview'];
const dates = ['2026-10-28', '2026-10-26', '2026-10-24'];

function milestone(id, name, event, theme, hypothesis, experiment, quotes) {
  return {
    id, name, event, theme, hypothesis,
    experiment: {
      title: experiment[0], change: experiment[1], metric: experiment[2],
      guardrail: experiment[3],
    },
    comments: quotes.map((quote, index) => ({
      id: `DEMO-${id.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
      segment: SEGMENTS[index % SEGMENTS.length],
      channel: channels[index % channels.length], quote,
      date: dates[index % dates.length], fictional: true,
    })),
  };
}

export const JOURNEYS = [
  {
    id: 'onboarding', name: 'Onboarding', icon: 'sparkles',
    description: 'From a new account to the first moment of value.',
    completionWindow: '7 days',
    steps: [
      milestone('create-account', 'Create account', 'account_created', 'Sign-up clarity',
        'Password requirements and a long form may prevent some customers from finishing sign-up.',
        ['Simplify account creation', 'Show password rules before submission and reduce the initial form to essential fields.', 'Account creation completion rate', 'No increase in invalid accounts or abuse reports'],
        ['I filled everything in and only then found out my password was not accepted.', 'Can we create the workspace before adding our billing details?', 'Our team needs to know whether sign-up supports our company identity provider.']),
      milestone('verify-email', 'Verify email', 'email_verified', 'Verification email delays',
        'Delayed verification emails and an unclear resend action may contribute to abandonment.',
        ['Make verification recoverable', 'Add a visible resend countdown and let customers correct their email address.', 'Email verification completion rate', 'Resend volume and email delivery reputation'],
        ['The code did not arrive, and I could not find where to request another one.', 'I accidentally used an old email address and could not change it.', 'The verification message was held by our company email filter.']),
      milestone('connect-workspace', 'Connect workspace', 'workspace_connected', 'Permissions & setup uncertainty',
        'Customers may leave when connection permissions are unclear or an admin is unavailable. The support themes suggest a possible explanation, not a proven cause.',
        ['Guide the first connection', 'Test inline permission guidance, a connection check, and a clear option to invite an admin or try a sample workspace.', 'Workspace connection completion rate; target a 5 percentage point lift', 'Permission error rate and support conversations per 100 entrants'],
        ['I clicked Connect three times. It kept asking for permissions, but I had no idea which ones.', 'We needed an admin to approve access, and I did not know how to bring them into the setup.', 'Our security team wanted an explanation of the requested permissions before we could connect.', 'I just wanted to see what the product does before connecting our actual workspace.', 'The permission screen opened, but after approving it I landed back on the same page.', 'The setup guide did not say whether our service account needed organization-wide access.']),
      milestone('invite-teammates', 'Invite teammates', 'teammates_invited', 'Invitation uncertainty',
        'Mandatory invitations before first value may interrupt solo evaluators and customers who need approval.',
        ['Let customers invite later', 'Offer an explicit Invite later action and show invitation status for each teammate.', 'Invite-step completion rate and first-value rate', 'Seven-day teammate activation rate'],
        ['I am trying this on my own. Why do I need to invite someone before I can continue?', 'I sent the invites twice because there was no confirmation the first time.', 'We need to validate the workspace before inviting the wider team.']),
      milestone('first-value', 'Reach first value', 'first_workflow_completed', 'Empty-state guidance',
        'A blank initial workspace may leave customers uncertain about the next useful action.',
        ['Start with a useful template', 'Offer a recommended starter workflow with sample data and a short checklist.', 'First workflow completion within seven days', 'Seven-day return rate and template deletion rate'],
        ['The setup was done, but the empty dashboard did not tell me what to do next.', 'I could use an example workflow instead of building one from scratch.', 'We finished configuration but could not tell whether the first workflow had succeeded.']),
    ],
  },
  {
    id: 'checkout', name: 'Checkout', icon: 'shopping-bag',
    description: 'From cart review to a confirmed purchase.',
    completionWindow: '24 hours',
    steps: [
      milestone('view-cart', 'Review cart', 'cart_reviewed', 'Price transparency',
        'An unclear final price may prompt customers to leave the cart before entering their details.',
        ['Show the total earlier', 'Display estimated tax, delivery fees, and a clear order total in the cart.', 'Cart review completion rate', 'Pricing-related complaints and average order value'],
        ['I could not work out the final price without continuing through checkout.', 'The discount appeared to apply, but the total did not change.', 'We need a cost summary before sending the order for approval.']),
      milestone('add-details', 'Add details', 'customer_details_added', 'Form validation',
        'Late or ambiguous address validation may cause retries and lost progress.',
        ['Validate details inline', 'Keep entered values on errors and show field-specific guidance before customers continue.', 'Customer-details completion rate', 'Address correction rate after purchase'],
        ['It said my address was invalid but did not tell me which part to fix.', 'When validation failed, the form cleared all the details I had entered.', 'The form would not accept our company registration format.']),
      milestone('select-delivery', 'Choose delivery', 'delivery_selected', 'Delivery expectations',
        'Unclear delivery dates or unexpected fees may discourage customers from selecting an option.',
        ['Clarify delivery options', 'Show arrival dates and full fees beside each delivery choice.', 'Delivery-step completion rate', 'Delivery complaints and shipping margin'],
        ['Standard delivery does not tell me when the order will arrive.', 'The fee changed after we selected our region.', 'We could not find an option for delivery to several office locations.']),
      milestone('make-payment', 'Make payment', 'payment_authorized', 'Unclear payment failures',
        'Generic card errors and lost form state may contribute to repeated attempts. The association needs validation with payment-provider logs.',
        ['Recover failed payments', 'Test actionable decline messages, preserve safe form state, and offer an alternative payment method.', 'Payment-step completion rate; target a 4 percentage point lift', 'Duplicate charges, fraud rate, and payment-provider cost'],
        ['It just said Something went wrong. I tried my card four times and still do not know why it failed.', 'The bank approved the payment, but checkout sent us back to the payment form.', 'We need an invoice option because our company cards have transaction limits.', 'After the failure, I had to enter all my payment information again.', 'There was no way to switch to a different payment method after the first attempt.', 'The decline message did not tell our purchasing team whether a charge had been created.']),
      milestone('confirm-order', 'Confirm order', 'order_confirmed', 'Order confirmation clarity',
        'Uncertainty about whether payment succeeded may prevent customers from completing the final confirmation.',
        ['Make order status explicit', 'Display a single clear confirmation state and send a receipt immediately after a successful order.', 'Confirmed orders per payment authorization', 'Duplicate orders and receipt delivery failures'],
        ['I paid but never saw an order number, so I was not sure whether it went through.', 'The receipt arrived late, and we nearly ordered a second time.', 'We need a downloadable confirmation for our procurement records.']),
    ],
  },
  {
    id: 'integrations', name: 'Integrations', icon: 'plug',
    description: 'From selecting a connector to a successful first sync.',
    completionWindow: '3 days',
    steps: [
      milestone('find-connector', 'Find connector', 'connector_selected', 'Connector discoverability',
        'Customers may not recognize the connector name or understand whether their data source is supported.',
        ['Clarify connector coverage', 'Add recognizable connector names, supported use cases, and a short compatibility checklist.', 'Connector selection completion rate', 'Unsupported-source attempts and search abandonment'],
        ['I searched for our CRM but could not tell which connector to use.', 'Does this integration work with the version of the service we use?', 'We need to know whether the connector supports our regional instance.']),
      milestone('select-account', 'Select account', 'integration_account_selected', 'Account selection',
        'Ambiguous account labels may lead customers to select the wrong source or abandon setup.',
        ['Identify the right account', 'Show organization name, account owner, and environment beside each available account.', 'Account-selection completion rate', 'Wrong-account reconnections within seven days'],
        ['Both accounts had the same name. I did not know which one held our live data.', 'The account picker kept taking me to my personal account.', 'We need to distinguish our production and test tenants before granting access.']),
      milestone('authorize-access', 'Authorize access', 'integration_authorized', 'OAuth permission failures',
        'Expired authorization sessions or unclear required permissions may contribute to exits during authorization.',
        ['Make authorization resilient', 'Test a preflight permissions check, a clear explanation of access, and a retry that preserves the selected account.', 'Authorization completion rate; target a 6 percentage point lift', 'Unexpected permission grants and token refresh failures'],
        ['I approved the connection, but it returned an expired session error and made me start over.', 'The permissions page did not explain why the connector needed write access.', 'Only our tenant admin can grant this permission, but setup did not mention that until the last screen.', 'The authorization window closed and nothing changed in the dashboard.', 'The connection failed after consent, and I could not tell whether to retry or ask an admin.', 'Our conditional access policy blocked the request, but the product only showed a generic error.']),
      milestone('map-fields', 'Map fields', 'field_mapping_saved', 'Schema mapping confusion',
        'Unclear required fields and unfamiliar source labels may create avoidable mapping errors.',
        ['Preview field mappings', 'Suggest common mappings and show a sample record with required fields highlighted.', 'Field-mapping completion rate', 'Invalid records and post-sync mapping corrections'],
        ['I do not know which source field maps to the required customer identifier.', 'A preview of one record would help us check the mapping before saving.', 'We need to map a custom schema, but the required fields are not explained.']),
      milestone('first-sync', 'Complete first sync', 'first_sync_completed', 'Sync status & recovery',
        'Unclear progress and poor recovery from partial failures may cause customers to abandon the first sync.',
        ['Make the first sync observable', 'Show records processed, explain partial failures, and allow retry of failed records.', 'First successful sync within three days', 'Data duplication and invalid record rate'],
        ['It has said Syncing for twenty minutes. I cannot tell whether it is stuck.', 'One record failed, and I was unsure whether the rest of the data had imported.', 'We need the error details and an option to retry only the failed records.']),
    ],
  },
  {
    id: 'renewal', name: 'Subscription renewal', icon: 'refresh-cw',
    description: 'From renewal notice to a renewed subscription.',
    completionWindow: '14 days',
    steps: [
      milestone('renewal-notice', 'Open renewal notice', 'renewal_notice_opened', 'Renewal visibility',
        'A renewal notice sent to an inactive billing contact may prevent the responsible person from starting renewal.',
        ['Reach the right billing contact', 'Show the current renewal owner in-product and make billing-contact updates easy.', 'Renewal notice engagement rate', 'Duplicate reminders and notification unsubscribes'],
        ['Our renewal reminder went to someone who no longer works here.', 'I saw the email but could not tell whether any action was required.', 'The billing contact and the person who approves renewal are different people.']),
      milestone('review-plan', 'Review plan', 'renewal_plan_reviewed', 'Pricing & seat changes',
        'Unexplained price changes and seat calculations may slow renewal review, especially for larger accounts.',
        ['Explain the renewal change', 'Test a side-by-side comparison of current and renewed price, seats, and entitlements, with a shareable approval summary.', 'Plan-review completion rate; target a 5 percentage point lift', 'Renewal margin and billing disputes per 100 renewals'],
        ['The renewal price was higher, but I could not see what had changed.', 'I needed to understand which seats we were paying for before approving the new plan.', 'Our renewal quote includes inactive seats, and there is no clear breakdown to share with procurement.', 'I was not sure whether the new plan included the features we use today.', 'The annual total and the per-seat amount did not make the change easy to explain.', 'We needed a comparison of current and renewed entitlements to get internal approval.']),
      milestone('confirm-seats', 'Confirm seats', 'renewal_seats_confirmed', 'Seat management',
        'Customers may be unsure how removing inactive users affects their renewal or access.',
        ['Preview seat changes', 'Show active and inactive seat counts and preview access effects before confirmation.', 'Seat confirmation completion rate', 'Accidental access loss and seat-reversal requests'],
        ['Can I remove unused seats now without cutting off access before renewal?', 'We had to count inactive users ourselves before confirming the seats.', 'We need an export of seat assignments to validate the renewal with each department.']),
      milestone('update-payment', 'Update payment', 'renewal_payment_ready', 'Expired payment details',
        'Expired cards or unclear invoice terms may prevent otherwise willing customers from proceeding.',
        ['Fix billing before renewal', 'Flag expiring payment details early and offer the eligible billing methods in one place.', 'Payment readiness before renewal date', 'Payment failures, unpaid invoices, and billing support volume'],
        ['My card had expired, but I did not see the warning until I tried to renew.', 'I updated the card, but the page still showed the old one.', 'Our invoice terms require a purchase order, and we could not find where to add it.']),
      milestone('complete-renewal', 'Renew subscription', 'subscription_renewed', 'Renewal confirmation',
        'Unclear final status may leave customers unsure whether their subscription and access are secured.',
        ['Confirm the renewed term', 'Show the renewal dates, next charge, and receipt in a single confirmation.', 'Completed renewals per payment-ready customer', 'Duplicate renewal requests and entitlement interruptions'],
        ['I clicked Renew but could not tell whether the subscription was extended.', 'We need a receipt that clearly shows the new subscription dates.', 'Our admin needs confirmation that every workspace retained its entitlements.']),
    ],
  },
];

// Counts at entry plus after each of five milestones, for a 30-day sample.
// Each segment has disjoint customers. No one skips a milestone.
const COHORTS = {
  onboarding: {
    Startup: { counts: [5200, 4940, 4347, 2565, 2290, 2061], repeat: [5, 12, 39, 13, 12], errors: [3, 5, 23, 5, 6], support: [38, 76, 312, 64, 42], repeatTotal: 2170, errorTotal: 1392 },
    Growth: { counts: [3100, 3007, 2797, 2294, 2110, 1983], repeat: [3, 8, 24, 10, 8], errors: [2, 4, 14, 4, 4], support: [17, 38, 126, 32, 24], repeatTotal: 1040, errorTotal: 610 },
    Enterprise: { counts: [1700, 1683, 1632, 1485, 1411, 1355], repeat: [2, 5, 13, 7, 5], errors: [1, 3, 8, 2, 3], support: [8, 17, 55, 18, 13], repeatTotal: 356, errorTotal: 219 },
  },
  checkout: {
    Startup: { counts: [4000, 3720, 3534, 3287, 2038, 1977], repeat: [4, 13, 9, 43, 5], errors: [1, 9, 4, 29, 2], support: [26, 74, 53, 287, 24], repeatTotal: 1870, errorTotal: 1270 },
    Growth: { counts: [2600, 2496, 2396, 2252, 1779, 1743], repeat: [3, 9, 6, 29, 4], errors: [1, 6, 3, 19, 1], support: [13, 39, 25, 136, 12], repeatTotal: 930, errorTotal: 588 },
    Enterprise: { counts: [1400, 1372, 1345, 1291, 1162, 1150], repeat: [2, 5, 4, 16, 3], errors: [1, 3, 2, 10, 1], support: [7, 18, 14, 67, 7], repeatTotal: 318, errorTotal: 210 },
  },
  integrations: {
    Startup: { counts: [1800, 1710, 1625, 991, 912, 821], repeat: [7, 12, 44, 17, 20], errors: [2, 6, 31, 9, 12], support: [22, 37, 189, 41, 57], repeatTotal: 978, errorTotal: 691 },
    Growth: { counts: [1900, 1843, 1769, 1398, 1300, 1235], repeat: [4, 8, 28, 12, 13], errors: [1, 4, 18, 6, 7], support: [18, 29, 122, 34, 42], repeatTotal: 760, errorTotal: 458 },
    Enterprise: { counts: [1300, 1287, 1248, 1061, 1008, 988], repeat: [3, 5, 19, 8, 7], errors: [1, 3, 12, 4, 4], support: [11, 18, 81, 21, 25], repeatTotal: 384, errorTotal: 259 },
  },
  renewal: {
    Startup: { counts: [2600, 2548, 1987, 1888, 1718, 1666], repeat: [3, 21, 9, 16, 4], errors: [1, 4, 3, 11, 2], support: [18, 114, 38, 62, 17], repeatTotal: 910, errorTotal: 382 },
    Growth: { counts: [1800, 1782, 1283, 1232, 1170, 1135], repeat: [2, 31, 14, 10, 3], errors: [1, 6, 4, 7, 1], support: [12, 143, 41, 38, 11], repeatTotal: 849, errorTotal: 240 },
    Enterprise: { counts: [1600, 1584, 950, 912, 885, 876], repeat: [2, 45, 18, 7, 2], errors: [1, 8, 5, 4, 1], support: [13, 221, 57, 24, 9], repeatTotal: 900, errorTotal: 205 },
  },
};

const round = value => Math.round(value * 10) / 10;
const rate = (part, whole) => whole > 0 ? round(part / whole * 100) : 0;
const periodFactor = { 7: 0.238, 30: 1, 90: 2.864 };
const scale = (value, period) => Math.round(value * periodFactor[period]);

function segmentStep(journeyId, segment, index, period) {
  const cohort = COHORTS[journeyId][segment];
  const entered = scale(cohort.counts[index], period);
  const completed = scale(cohort.counts[index + 1], period);
  const repeatUsers = Math.round(entered * cohort.repeat[index] / 100);
  const errorUsers = Math.round(entered * cohort.errors[index] / 100);
  return {
    segment, entered, completed, dropped: entered - completed,
    dropRate: rate(entered - completed, entered),
    repeatUsers, repeatRate: rate(repeatUsers, entered),
    errorUsers, errorRate: rate(errorUsers, entered),
    supportCount: scale(cohort.support[index], period),
  };
}

/** Return a fresh, deterministic view of one sample journey. */
export function getJourneyData(journeyId = 'onboarding', segment = 'all', period = 30) {
  const journey = JOURNEYS.find(item => item.id === journeyId) || JOURNEYS[0];
  const selectedSegments = SEGMENTS.includes(segment) ? [segment] : SEGMENTS;
  const normalizedPeriod = PERIODS.some(item => item.value === Number(period)) ? Number(period) : 30;
  const steps = journey.steps.map((step, index) => {
    const segmentBreakdown = SEGMENTS.map(name => segmentStep(journey.id, name, index, normalizedPeriod));
    const selected = segmentBreakdown.filter(item => selectedSegments.includes(item.segment));
    const sum = key => selected.reduce((total, item) => total + item[key], 0);
    const entered = sum('entered');
    const completed = sum('completed');
    const dropped = entered - completed;
    const dropRate = rate(dropped, entered);
    const repeatUsers = sum('repeatUsers');
    const errorUsers = sum('errorUsers');
    const highFriction = index === ({ onboarding: 2, checkout: 3, integrations: 2, renewal: 1 })[journey.id];
    const change = highFriction ? 3.2 : index === 0 ? -0.4 : 0.6;
    const previousDropRate = round(Math.max(0, Math.min(100, dropRate - change)));
    const trend = Array.from({ length: 14 }, (_, day) => {
      const progress = day / 13;
      const wave = Math.sin((day + index * 2) * 1.7) * (highFriction ? 1.3 : 0.5);
      return round(Math.max(0, Math.min(100, previousDropRate + change * progress + wave)));
    });
    trend[13] = dropRate;
    return {
      ...step,
      comments: step.comments.filter(comment => selectedSegments.includes(comment.segment)),
      entered, completed, dropped, dropRate,
      repeatUsers, repeatRate: rate(repeatUsers, entered),
      errorUsers, errorRate: rate(errorUsers, entered),
      supportCount: sum('supportCount'), previousDropRate, trend, segmentBreakdown,
    };
  });
  const entered = steps[0].entered;
  const completed = steps[steps.length - 1].completed;
  const repeatUsers = selectedSegments.reduce((sum, name) => sum + scale(COHORTS[journey.id][name].repeatTotal, normalizedPeriod), 0);
  const errorUsers = selectedSegments.reduce((sum, name) => sum + scale(COHORTS[journey.id][name].errorTotal, normalizedPeriod), 0);
  const abandoned = entered - completed;
  return {
    journey, segment: selectedSegments.length === 1 ? selectedSegments[0] : 'all', period: normalizedPeriod,
    steps, entered, completed, completionRate: rate(completed, entered),
    abandoned, abandonmentRate: rate(abandoned, entered),
    repeatUsers, repeatRate: rate(repeatUsers, entered),
    errorUsers, errorRate: rate(errorUsers, entered),
    supportCount: steps.reduce((sum, step) => sum + step.supportCount, 0),
    worstStep: steps.reduce((worst, step) => step.dropped > worst.dropped ? step : worst, steps[0]),
  };
}

export const SAMPLE_DATA_NOTICE = 'Fictional sample data · No live customer information';
