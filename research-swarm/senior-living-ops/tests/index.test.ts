/**
 * Senior Living Operations - Test Suite
 * 
 * Comprehensive test coverage for all skill tools and workflows.
 * Run with: npm test
 */

import {
  wellness_check,
  ieq_alert_escalate,
  family_notify,
  daily_ops_report,
  wellstack_mock_data,
  resident_lookup,
  staff_schedule,
  WellStackMockData
} from '../index';

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];

  async test(name: string, fn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - start
      });
      console.log(`✅ ${name} (${Date.now() - start}ms)`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start
      });
      console.log(`❌ ${name} (${Date.now() - start}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  assertEqual(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertTrue(value: boolean, message?: string): void {
    if (!value) {
      throw new Error(message || 'Expected true, got false');
    }
  }

  assertFalse(value: boolean, message?: string): void {
    if (value) {
      throw new Error(message || 'Expected false, got true');
    }
  }

  assertDefined(value: any, message?: string): void {
    if (value === undefined || value === null) {
      throw new Error(message || 'Expected defined value, got undefined/null');
    }
  }

  assertArrayLength(arr: any[], minLength: number, message?: string): void {
    if (!arr || arr.length < minLength) {
      throw new Error(message || `Expected array with at least ${minLength} items, got ${arr?.length || 0}`);
    }
  }

  summary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Duration: ${totalTime}ms`);
    console.log('='.repeat(50));

    if (failed > 0) {
      process.exit(1);
    }
  }
}

// ============================================================================
// WELLSTACK MOCK DATA TESTS
// ============================================================================

async function testWellStackMockData(runner: TestRunner): Promise<void> {
  console.log('\n📦 WellStack Mock Data Tests\n');

  await runner.test('generateResidents - default count', async () => {
    const result = await wellstack_mock_data({
      data_type: 'residents',
      scenario: 'normal'
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.record_count, 50);
    runner.assertArrayLength(result.data, 50);
  });

  await runner.test('generateResidents - custom count', async () => {
    const result = await wellstack_mock_data({
      data_type: 'residents',
      count: 10,
      scenario: 'normal'
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.record_count, 10);
    runner.assertArrayLength(result.data, 10);
  });

  await runner.test('generateResidents - high acuity scenario', async () => {
    const result = await wellstack_mock_data({
      data_type: 'residents',
      count: 20,
      scenario: 'high_acuity'
    });
    runner.assertTrue(result.success);
    const highAcuityLevels = ['assisted', 'memory_care', 'skilled_nursing'];
    result.data.forEach((r: any) => {
      if (!highAcuityLevels.includes(r.care_level)) {
        throw new Error(`Expected high acuity care level, got ${r.care_level}`);
      }
    });
  });

  await runner.test('generateStaff - creates valid staff', async () => {
    const result = await wellstack_mock_data({
      data_type: 'staff',
      count: 15
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.record_count, 15);
    const validRoles = ['rn', 'lpn', 'cna', 'caregiver', 'maintenance', 'admin', 'activities'];
    result.data.forEach((s: any) => {
      if (!validRoles.includes(s.role)) {
        throw new Error(`Invalid role: ${s.role}`);
      }
    });
  });

  await runner.test('generateIEQAlerts - creates alerts', async () => {
    const result = await wellstack_mock_data({
      data_type: 'alerts_history',
      count: 10
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.record_count, 10);
  });

  await runner.test('generateFullFacility - returns complete data', async () => {
    const result = await wellstack_mock_data({
      data_type: 'full_facility'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.data.residents);
    runner.assertDefined(result.data.staff);
    runner.assertDefined(result.data.alerts);
  });

  await runner.test('invalid data type returns error', async () => {
    const result = await wellstack_mock_data({
      data_type: 'invalid_type'
    });
    runner.assertFalse(result.success);
    runner.assertDefined(result.message);
  });
}

// ============================================================================
// RESIDENT LOOKUP TESTS
// ============================================================================

async function testResidentLookup(runner: TestRunner): Promise<void> {
  console.log('\n👤 Resident Lookup Tests\n');

  // First, seed some test data
  await wellstack_mock_data({ data_type: 'residents', count: 10 });

  await runner.test('lookup by resident_id', async () => {
    const result = await resident_lookup({
      resident_id: 'RES-2024-001'
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.count, 1);
    runner.assertDefined(result.results[0]);
  });

  await runner.test('lookup by query string', async () => {
    const result = await resident_lookup({
      query: 'Smith'
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.count >= 0);
  });

  await runner.test('lookup with filters - care_level', async () => {
    const result = await resident_lookup({
      filters: { care_level: 'assisted' }
    });
    runner.assertTrue(result.success);
    result.results.forEach((r: any) => {
      runner.assertEqual(r.care_level, 'assisted');
    });
  });

  await runner.test('lookup with include_history', async () => {
    const result = await resident_lookup({
      resident_id: 'RES-2024-001',
      include_history: true
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.results[0]?.recent_checks);
  });

  await runner.test('lookup respects limit', async () => {
    const result = await resident_lookup({
      limit: 5
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.results.length <= 5);
  });

  await runner.test('lookup non-existent resident', async () => {
    const result = await resident_lookup({
      resident_id: 'RES-NOT-EXIST'
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.count, 0);
  });
}

// ============================================================================
// WELLNESS CHECK TESTS
// ============================================================================

async function testWellnessCheck(runner: TestRunner): Promise<void> {
  console.log('\n💓 Wellness Check Tests\n');

  await runner.test('basic wellness check - success', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      vitals: {
        temperature: 36.8,
        blood_pressure: '120/80',
        heart_rate: 72
      },
      mood: 'good'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.check_id);
    runner.assertEqual(result.alerts.length, 0);
  });

  await runner.test('detects fever alert', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      vitals: {
        temperature: 38.5,
        blood_pressure: '120/80',
        heart_rate: 72
      }
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.alerts.some((a: string) => a.includes('FEVER')));
  });

  await runner.test('detects high heart rate', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      vitals: {
        temperature: 36.8,
        heart_rate: 110
      }
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.alerts.some((a: string) => a.includes('HIGH_HR') || a.includes('TACHYCARDIA')));
  });

  await runner.test('detects low oxygen', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      vitals: {
        oxygen_saturation: 89
      }
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.alerts.some((a: string) => a.includes('LOW_O2') || a.includes('OXYGEN')));
  });

  await runner.test('detects severe pain', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      pain_level: 8
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.alerts.some((a: string) => a.includes('PAIN')));
  });

  await runner.test('detects medication refusal', async () => {
    const result = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      medication_taken: false
    });
    runner.assertTrue(result.success);
    runner.assertTrue(result.alerts.some((a: string) => a.includes('MEDICATION')));
  });

  await runner.test('fails with invalid resident_id', async () => {
    const result = await wellness_check({
      resident_id: 'RES-NOT-EXIST',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001'
    });
    runner.assertFalse(result.success);
    runner.assertTrue(result.message?.includes('RESIDENT_NOT_FOUND'));
  });
}

// ============================================================================
// IEQ ALERT ESCALATION TESTS
// ============================================================================

async function testIEQAlertEscalation(runner: TestRunner): Promise<void> {
  console.log('\n🚨 IEQ Alert Escalation Tests\n');

  await runner.test('low severity - level 1 escalation', async () => {
    const result = await ieq_alert_escalate({
      alert_id: 'IEQ-TEST-001',
      sensor_type: 'temperature',
      location: 'Room 101',
      severity: 'low',
      current_value: 27,
      threshold_value: 26,
      timestamp: new Date().toISOString()
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.escalation_level, 1);
  });

  await runner.test('medium severity - level 2 escalation', async () => {
    const result = await ieq_alert_escalate({
      alert_id: 'IEQ-TEST-002',
      sensor_type: 'humidity',
      location: 'Corridor A',
      severity: 'medium',
      current_value: 70,
      threshold_value: 60,
      timestamp: new Date().toISOString()
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.escalation_level, 2);
    runner.assertTrue(result.actions_triggered.length > 0);
  });

  await runner.test('high severity - level 3 escalation', async () => {
    const result = await ieq_alert_escalate({
      alert_id: 'IEQ-TEST-003',
      sensor_type: 'co2',
      location: 'Dining Hall',
      severity: 'high',
      current_value: 1200,
      threshold_value: 1000,
      affected_residents: ['RES-001', 'RES-002'],
      timestamp: new Date().toISOString()
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.escalation_level, 3);
    runner.assertEqual(result.assigned_to, 'Nursing Supervisor');
  });

  await runner.test('critical severity - level 4 escalation', async () => {
    const result = await ieq_alert_escalate({
      alert_id: 'IEQ-TEST-004',
      sensor_type: 'air_quality',
      location: 'Common Area',
      severity: 'critical',
      current_value: 500,
      threshold_value: 100,
      timestamp: new Date().toISOString()
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.escalation_level, 4);
    runner.assertEqual(result.assigned_to, 'Administrator');
    runner.assertTrue(result.actions_triggered.some((a: string) => a.includes('EMERGENCY')));
  });
}

// ============================================================================
// FAMILY NOTIFICATION TESTS
// ============================================================================

async function testFamilyNotification(runner: TestRunner): Promise<void> {
  console.log('\n📧 Family Notification Tests\n');

  await runner.test('successful notification', async () => {
    const result = await family_notify({
      resident_id: 'RES-2024-001',
      notification_type: 'wellness_update',
      family_contacts: [{
        name: 'Test Contact',
        relationship: 'Daughter',
        channel: 'email',
        contact_info: 'test@example.com',
        priority: 1
      }],
      message_content: {
        subject: 'Test',
        body: 'Test message',
        include_vitals: false,
        include_photo: false,
        language: 'en'
      }
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.message_id);
    runner.assertDefined(result.sent_at);
  });

  await runner.test('fails with invalid resident', async () => {
    const result = await family_notify({
      resident_id: 'RES-NOT-EXIST',
      notification_type: 'wellness_update',
      family_contacts: [],
      message_content: {
        subject: 'Test',
        body: 'Test',
        include_vitals: false,
        include_photo: false,
        language: 'en'
      }
    });
    runner.assertFalse(result.success);
  });

  await runner.test('multi-channel delivery', async () => {
    const result = await family_notify({
      resident_id: 'RES-2024-001',
      notification_type: 'urgent',
      family_contacts: [
        { name: 'Contact1', relationship: 'Son', channel: 'email', contact_info: 'c1@test.com', priority: 1 },
        { name: 'Contact2', relationship: 'Daughter', channel: 'sms', contact_info: '+15550001', priority: 2 }
      ],
      message_content: {
        subject: 'Urgent',
        body: 'Urgent message',
        include_vitals: true,
        include_photo: false,
        language: 'en'
      }
    });
    runner.assertTrue(result.success);
    runner.assertEqual(result.delivery_status.length, 2);
  });
}

// ============================================================================
// DAILY OPS REPORT TESTS
// ============================================================================

async function testDailyOpsReport(runner: TestRunner): Promise<void> {
  console.log('\n📊 Daily Ops Report Tests\n');

  await runner.test('generates report successfully', async () => {
    const result = await daily_ops_report({
      facility_id: 'FAC-TEST-001',
      report_date: '2024-03-01',
      report_type: 'summary'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.report_id);
    runner.assertDefined(result.summary_stats);
  });

  await runner.test('report includes all stats', async () => {
    const result = await daily_ops_report({
      facility_id: 'FAC-TEST-001'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.summary_stats.total_residents);
    runner.assertDefined(result.summary_stats.wellness_checks_completed);
    runner.assertDefined(result.summary_stats.ieq_alerts);
    runner.assertDefined(result.summary_stats.staff_present);
  });

  await runner.test('markdown format includes content', async () => {
    const result = await daily_ops_report({
      facility_id: 'FAC-TEST-001',
      format: 'markdown'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.content);
    runner.assertTrue(result.content.includes('Daily Operations Report'));
  });
}

// ============================================================================
// STAFF SCHEDULE TESTS
// ============================================================================

async function testStaffSchedule(runner: TestRunner): Promise<void> {
  console.log('\n👥 Staff Schedule Tests\n');

  await runner.test('returns schedule', async () => {
    const result = await staff_schedule({
      date: '2024-03-01'
    });
    runner.assertTrue(result.success);
    runner.assertDefined(result.schedule);
  });

  await runner.test('filters by department', async () => {
    const result = await staff_schedule({
      department: 'nursing'
    });
    runner.assertTrue(result.success);
    result.schedule.forEach((s: any) => {
      runner.assertEqual(s.department, 'nursing');
    });
  });

  await runner.test('filters by shift', async () => {
    const result = await staff_schedule({
      shift: 'morning'
    });
    runner.assertTrue(result.success);
    result.schedule.forEach((s: any) => {
      runner.assertEqual(s.shift, 'morning');
    });
  });
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

async function testIntegration(runner: TestRunner): Promise<void> {
  console.log('\n🔗 Integration Tests\n');

  await runner.test('full workflow - wellness check to family notification', async () => {
    // 1. Get a resident
    const lookup = await resident_lookup({ resident_id: 'RES-2024-001' });
    runner.assertTrue(lookup.success);

    // 2. Perform wellness check with concerning findings
    const check = await wellness_check({
      resident_id: 'RES-2024-001',
      check_type: 'morning',
      staff_id: 'STAFF-RN-001',
      vitals: { temperature: 38.2 },
      pain_level: 8,
      notes: 'Resident appears uncomfortable'
    });
    runner.assertTrue(check.success);
    runner.assertTrue(check.alerts.length > 0);

    // 3. Notify family
    const notification = await family_notify({
      resident_id: 'RES-2024-001',
      notification_type: 'wellness_update',
      family_contacts: [{
        name: 'Family Member',
        relationship: 'Daughter',
        channel: 'email',
        contact_info: 'family@test.com',
        priority: 1
      }],
      message_content: {
        subject: 'Wellness Update - Attention Required',
        body: `We wanted to inform you of some changes in condition...`,
        include_vitals: true,
        include_photo: false,
        language: 'en'
      },
      urgency: 'important'
    });
    runner.assertTrue(notification.success);
  });

  await runner.test('full workflow - IEQ alert to daily report', async () => {
    // 1. Create IEQ alert
    const alert = await ieq_alert_escalate({
      alert_id: 'IEQ-INT-001',
      sensor_type: 'co2',
      location: 'Test Room',
      severity: 'high',
      current_value: 1200,
      threshold_value: 1000,
      timestamp: new Date().toISOString()
    });
    runner.assertTrue(alert.success);

    // 2. Generate report that includes this alert
    const report = await daily_ops_report({
      facility_id: 'FAC-TEST-001',
      include_sections: ['ieq', 'incidents']
    });
    runner.assertTrue(report.success);
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests(): Promise<void> {
  const runner = new TestRunner();

  console.log('\n' + '='.repeat(50));
  console.log('SENIOR LIVING OPERATIONS - TEST SUITE');
  console.log('='.repeat(50));

  await testWellStackMockData(runner);
  await testResidentLookup(runner);
  await testWellnessCheck(runner);
  await testIEQAlertEscalation(runner);
  await testFamilyNotification(runner);
  await testDailyOpsReport(runner);
  await testStaffSchedule(runner);
  await testIntegration(runner);

  runner.summary();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, TestRunner };
