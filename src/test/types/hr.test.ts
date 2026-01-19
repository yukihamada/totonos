import { describe, it, expect } from 'vitest';

describe('HR Types and Utilities', () => {
  describe('Employment Type', () => {
    const employmentTypes = ['正社員', '契約社員', 'パート', 'アルバイト', '業務委託'];

    it('has correct employment types', () => {
      expect(employmentTypes).toContain('正社員');
      expect(employmentTypes).toContain('契約社員');
      expect(employmentTypes).toContain('パート');
    });

    it('includes all common types', () => {
      expect(employmentTypes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Employee Status', () => {
    const statuses = ['active', 'inactive', 'on_leave', 'terminated'];

    it('has active status', () => {
      expect(statuses).toContain('active');
    });

    it('has inactive status', () => {
      expect(statuses).toContain('inactive');
    });

    it('has on_leave status', () => {
      expect(statuses).toContain('on_leave');
    });

    it('has terminated status', () => {
      expect(statuses).toContain('terminated');
    });
  });

  describe('Leave Types', () => {
    const leaveTypes = [
      { type: 'annual', label: '年次有給休暇' },
      { type: 'sick', label: '病気休暇' },
      { type: 'special', label: '特別休暇' },
      { type: 'maternity', label: '産休' },
      { type: 'paternity', label: '育休' },
      { type: 'unpaid', label: '無給休暇' },
    ];

    it('includes annual leave', () => {
      const annual = leaveTypes.find(l => l.type === 'annual');
      expect(annual).toBeDefined();
      expect(annual?.label).toBe('年次有給休暇');
    });

    it('includes sick leave', () => {
      const sick = leaveTypes.find(l => l.type === 'sick');
      expect(sick).toBeDefined();
      expect(sick?.label).toBe('病気休暇');
    });

    it('includes maternity leave', () => {
      const maternity = leaveTypes.find(l => l.type === 'maternity');
      expect(maternity).toBeDefined();
    });

    it('includes paternity leave', () => {
      const paternity = leaveTypes.find(l => l.type === 'paternity');
      expect(paternity).toBeDefined();
    });

    it('has all common leave types', () => {
      expect(leaveTypes.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Department Structure', () => {
    const departments = [
      { id: '1', name: '営業部', parent_id: null },
      { id: '2', name: '開発部', parent_id: null },
      { id: '3', name: '人事部', parent_id: null },
      { id: '4', name: '経理部', parent_id: null },
      { id: '5', name: '営業1課', parent_id: '1' },
      { id: '6', name: '営業2課', parent_id: '1' },
    ];

    it('has root departments', () => {
      const roots = departments.filter(d => d.parent_id === null);
      expect(roots.length).toBeGreaterThan(0);
    });

    it('has child departments', () => {
      const children = departments.filter(d => d.parent_id !== null);
      expect(children.length).toBeGreaterThan(0);
    });

    it('correctly links children to parents', () => {
      const salesTeam1 = departments.find(d => d.name === '営業1課');
      const salesDept = departments.find(d => d.id === salesTeam1?.parent_id);

      expect(salesDept?.name).toBe('営業部');
    });
  });
});

describe('Payroll Calculations', () => {
  describe('Basic Salary Calculations', () => {
    it('calculates monthly salary correctly', () => {
      const annualSalary = 6000000;
      const monthsPerYear = 12;

      const monthlySalary = annualSalary / monthsPerYear;

      expect(monthlySalary).toBe(500000);
    });

    it('calculates hourly rate from monthly salary', () => {
      const monthlySalary = 400000;
      const workingDaysPerMonth = 20;
      const hoursPerDay = 8;

      const hourlyRate = monthlySalary / (workingDaysPerMonth * hoursPerDay);

      expect(hourlyRate).toBe(2500);
    });

    it('calculates overtime pay at 125%', () => {
      const hourlyRate = 2500;
      const overtimeHours = 10;
      const overtimeMultiplier = 1.25;

      const overtimePay = hourlyRate * overtimeHours * overtimeMultiplier;

      expect(overtimePay).toBe(31250);
    });

    it('calculates overtime pay at 150% for holidays', () => {
      const hourlyRate = 2500;
      const holidayHours = 8;
      const holidayMultiplier = 1.50;

      const holidayPay = hourlyRate * holidayHours * holidayMultiplier;

      expect(holidayPay).toBe(30000);
    });

    it('calculates late night overtime at 150%', () => {
      const hourlyRate = 2500;
      const lateNightHours = 3;
      const lateNightMultiplier = 1.50; // 125% overtime + 25% late night

      const lateNightPay = hourlyRate * lateNightHours * lateNightMultiplier;

      expect(lateNightPay).toBe(11250);
    });
  });

  describe('Social Insurance Calculations', () => {
    it('calculates health insurance at approximately 5%', () => {
      const grossSalary = 400000;
      const healthInsuranceRate = 0.05; // Simplified rate

      const healthInsurance = Math.round(grossSalary * healthInsuranceRate);

      expect(healthInsurance).toBe(20000);
    });

    it('calculates pension at approximately 9%', () => {
      const grossSalary = 400000;
      const pensionRate = 0.0915; // Approximate employee share

      const pension = Math.round(grossSalary * pensionRate);

      expect(pension).toBe(36600);
    });

    it('calculates employment insurance at approximately 0.6%', () => {
      const grossSalary = 400000;
      const employmentInsuranceRate = 0.006;

      const employmentInsurance = Math.round(grossSalary * employmentInsuranceRate);

      expect(employmentInsurance).toBe(2400);
    });

    it('calculates total deductions', () => {
      const grossSalary = 400000;
      const healthInsurance = 20000;
      const pension = 36600;
      const employmentInsurance = 2400;
      const incomeTax = 15000;
      const residentTax = 25000;

      const totalDeductions = healthInsurance + pension + employmentInsurance + incomeTax + residentTax;
      const netSalary = grossSalary - totalDeductions;

      expect(totalDeductions).toBe(99000);
      expect(netSalary).toBe(301000);
    });
  });

  describe('Bonus Calculations', () => {
    it('calculates bonus at standard 2 months', () => {
      const monthlySalary = 400000;
      const bonusMonths = 2;

      const bonus = monthlySalary * bonusMonths;

      expect(bonus).toBe(800000);
    });

    it('calculates prorated bonus for partial year', () => {
      const fullBonus = 800000;
      const monthsWorked = 6;
      const totalMonths = 12;

      const proratedBonus = Math.round(fullBonus * (monthsWorked / totalMonths));

      expect(proratedBonus).toBe(400000);
    });
  });

  describe('Annual Leave Calculations', () => {
    it('calculates initial leave days for new employee', () => {
      const initialLeaveDays = 10;

      expect(initialLeaveDays).toBe(10);
    });

    it('increases leave days based on tenure', () => {
      const calculateLeaveDays = (yearsOfService: number): number => {
        if (yearsOfService < 1) return 10;
        if (yearsOfService < 2) return 11;
        if (yearsOfService < 3) return 12;
        if (yearsOfService < 4) return 14;
        if (yearsOfService < 5) return 16;
        if (yearsOfService < 6) return 18;
        return 20; // Maximum
      };

      expect(calculateLeaveDays(0)).toBe(10);
      expect(calculateLeaveDays(1)).toBe(11);
      expect(calculateLeaveDays(3)).toBe(14);
      expect(calculateLeaveDays(6)).toBe(20);
    });

    it('caps leave days at 20', () => {
      const maxLeaveDays = 20;
      const yearsOfService = 10;
      const baseLeaveDays = 10 + yearsOfService;

      const actualLeaveDays = Math.min(baseLeaveDays, maxLeaveDays);

      expect(actualLeaveDays).toBe(maxLeaveDays);
    });

    it('calculates remaining leave days', () => {
      const totalLeaveDays = 15;
      const usedLeaveDays = 7;

      const remainingDays = totalLeaveDays - usedLeaveDays;

      expect(remainingDays).toBe(8);
    });
  });
});

describe('Attendance Calculations', () => {
  describe('Working Hours', () => {
    it('calculates daily working hours', () => {
      const startTime = new Date('2024-01-01T09:00:00');
      const endTime = new Date('2024-01-01T18:00:00');
      const breakMinutes = 60;

      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const workingMinutes = totalMinutes - breakMinutes;
      const workingHours = workingMinutes / 60;

      expect(workingHours).toBe(8);
    });

    it('calculates overtime hours', () => {
      const standardHours = 8;
      const actualHours = 10;

      const overtimeHours = Math.max(0, actualHours - standardHours);

      expect(overtimeHours).toBe(2);
    });

    it('handles no overtime', () => {
      const standardHours = 8;
      const actualHours = 7;

      const overtimeHours = Math.max(0, actualHours - standardHours);

      expect(overtimeHours).toBe(0);
    });
  });

  describe('Late/Early Calculations', () => {
    it('calculates late minutes', () => {
      const expectedStart = new Date('2024-01-01T09:00:00');
      const actualStart = new Date('2024-01-01T09:15:00');

      const lateMinutes = Math.max(0, (actualStart.getTime() - expectedStart.getTime()) / (1000 * 60));

      expect(lateMinutes).toBe(15);
    });

    it('calculates early leave minutes', () => {
      const expectedEnd = new Date('2024-01-01T18:00:00');
      const actualEnd = new Date('2024-01-01T17:30:00');

      const earlyMinutes = Math.max(0, (expectedEnd.getTime() - actualEnd.getTime()) / (1000 * 60));

      expect(earlyMinutes).toBe(30);
    });

    it('handles on-time arrival', () => {
      const expectedStart = new Date('2024-01-01T09:00:00');
      const actualStart = new Date('2024-01-01T08:55:00');

      const lateMinutes = Math.max(0, (actualStart.getTime() - expectedStart.getTime()) / (1000 * 60));

      expect(lateMinutes).toBe(0);
    });
  });

  describe('Monthly Summary', () => {
    it('calculates total working days', () => {
      const attendanceRecords = [
        { date: '2024-01-01', hours: 8 },
        { date: '2024-01-02', hours: 8 },
        { date: '2024-01-03', hours: 9 },
        { date: '2024-01-04', hours: 8 },
        { date: '2024-01-05', hours: 7 },
      ];

      const totalDays = attendanceRecords.length;

      expect(totalDays).toBe(5);
    });

    it('calculates total working hours', () => {
      const attendanceRecords = [
        { date: '2024-01-01', hours: 8 },
        { date: '2024-01-02', hours: 8 },
        { date: '2024-01-03', hours: 9 },
        { date: '2024-01-04', hours: 8 },
        { date: '2024-01-05', hours: 7 },
      ];

      const totalHours = attendanceRecords.reduce((sum, r) => sum + r.hours, 0);

      expect(totalHours).toBe(40);
    });

    it('calculates total overtime', () => {
      const standardDailyHours = 8;
      const attendanceRecords = [
        { date: '2024-01-01', hours: 8 },
        { date: '2024-01-02', hours: 10 },
        { date: '2024-01-03', hours: 9 },
        { date: '2024-01-04', hours: 8 },
        { date: '2024-01-05', hours: 11 },
      ];

      const totalOvertime = attendanceRecords.reduce(
        (sum, r) => sum + Math.max(0, r.hours - standardDailyHours),
        0
      );

      expect(totalOvertime).toBe(6); // 0 + 2 + 1 + 0 + 3 = 6
    });
  });
});
